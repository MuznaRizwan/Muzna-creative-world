/**
 * Kinematic character controller for the cat (plain maths, fixed timestep).
 *
 * The body is a vertical cylinder: a circle in plan (collision radius) with a
 * height. Each step it turns, moves along its facing direction, is pushed out
 * of collider boxes, kept inside the walkable boundary, and then follows the
 * ground: stepping up or down small ledges, or falling under gravity.
 *
 * Yaw 0 faces +Z (the direction the cat model faces); positive yaw turns
 * towards +X, which is a left turn as seen from behind.
 */

/**
 * @typedef {object} MoveIntent
 * @property {number} move  −1 (backwards) … 1 (forwards).
 * @property {number} turn  −1 (right) … 1 (left).
 * @property {boolean} run
 * @property {boolean} jump  Jump was pressed (edge, not held).
 */

/**
 * @typedef {object} ControllerSettings
 * @property {number} radius @property {number} height @property {number} stepHeight
 * @property {number} walkSpeed @property {number} runSpeed @property {number} backSpeed
 * @property {number} acceleration @property {number} deceleration
 * @property {number} turnSpeed @property {number} runTurnSpeed @property {number} turnAcceleration
 * @property {number} faceSpeed
 * @property {number} gravity @property {number} jumpVelocity
 * @property {number} coyoteTime @property {number} jumpBuffer
 * @property {number} supportMargin @property {number} fallLimit
 * @property {number} fixedStep @property {number} maxSubSteps
 */

/** @param {number} angle */
function wrapAngle(angle) {
  let a = angle;
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

/** Exponential approach factor for a rate (1/s) over dt. @param {number} rate @param {number} dt */
function approach(rate, dt) {
  return 1 - Math.exp(-rate * dt);
}

export class CharacterController {
  /**
   * @param {import("./CollisionWorld").CollisionWorld} collision
   * @param {ControllerSettings} settings
   */
  constructor(collision, settings) {
    this.collision = collision;
    this.settings = settings;
    this.position = { x: 0, y: 0, z: 0 };
    /** State at the start of the last step, for render interpolation. */
    this.previous = { x: 0, y: 0, z: 0, yaw: 0 };
    this.yaw = 0;
    /** Signed speed along the facing direction (intended, before collisions). */
    this.speed = 0;
    /** Horizontal speed actually achieved in the last step (after collisions). */
    this.actualSpeed = 0;
    this.turnRate = 0;
    this.verticalVelocity = 0;
    this.grounded = true;
    this.running = false;
    /** When set, the controller turns to face this yaw and ignores movement input. */
    /** @type {number | null} */
    this.faceYaw = null;
    /** Movement input is ignored while locked (e.g. during an interaction). */
    this.locked = false;
    this.coyote = 0;
    this.jumpQueued = 0;
    /** Increments on each landing / jump, so the animation layer can react. */
    this.jumps = 0;
    this.landings = 0;
    this.lastFall = 0;
  }

  /**
   * Place the character, standing on the ground, facing `yaw`.
   * @param {number} x @param {number} z @param {number} yaw
   */
  teleport(x, z, yaw) {
    const { radius, height, stepHeight } = this.settings;
    const spot = this.collision.findFreeSpot(x, z, radius, height, stepHeight);
    const ground = this.collision.groundAt(spot.x, spot.z, this.collision.heightAt(spot.x, spot.z) + stepHeight, this.settings.supportMargin);
    this.position.x = spot.x;
    this.position.y = ground;
    this.position.z = spot.z;
    this.yaw = wrapAngle(yaw);
    this.speed = 0;
    this.actualSpeed = 0;
    this.turnRate = 0;
    this.verticalVelocity = 0;
    this.grounded = true;
    this.faceYaw = null;
    this.coyote = 0;
    this.jumpQueued = 0;
    this.savePrevious();
  }

  savePrevious() {
    this.previous.x = this.position.x;
    this.previous.y = this.position.y;
    this.previous.z = this.position.z;
    this.previous.yaw = this.yaw;
  }

  /**
   * Advance one fixed step.
   * @param {number} dt
   * @param {MoveIntent} intent
   */
  step(dt, intent) {
    const s = this.settings;
    this.savePrevious();
    const free = !this.locked;
    const move = free ? intent.move : 0;
    const turn = free ? intent.turn : 0;
    this.running = free && intent.run && move > 0;

    // Turning: either towards a requested heading, or from input with a little inertia.
    if (this.faceYaw !== null) {
      const diff = wrapAngle(this.faceYaw - this.yaw);
      const stepAngle = Math.sign(diff) * Math.min(Math.abs(diff), s.faceSpeed * dt);
      this.yaw = wrapAngle(this.yaw + stepAngle);
      this.turnRate = stepAngle / dt;
      if (Math.abs(diff) < 0.01) this.faceYaw = null;
    } else {
      const maxTurn = this.running ? s.runTurnSpeed : s.turnSpeed;
      this.turnRate += (turn * maxTurn - this.turnRate) * approach(s.turnAcceleration, dt);
      if (Math.abs(this.turnRate) < 1e-3 && turn === 0) this.turnRate = 0;
      this.yaw = wrapAngle(this.yaw + this.turnRate * dt);
    }

    // Speed along the facing direction.
    let target = 0;
    if (move > 0) target = (this.running ? s.runSpeed : s.walkSpeed) * move;
    else if (move < 0) target = s.backSpeed * move;
    const rate = Math.abs(target) > Math.abs(this.speed) ? s.acceleration : s.deceleration;
    this.speed += (target - this.speed) * approach(rate, dt);
    if (Math.abs(this.speed) < 0.01 && target === 0) this.speed = 0;

    // Horizontal move, collisions and boundary.
    const from = { x: this.position.x, z: this.position.z };
    this.position.x += Math.sin(this.yaw) * this.speed * dt;
    this.position.z += Math.cos(this.yaw) * this.speed * dt;
    // While airborne only boxes clearly below the feet are ignored, so jumps
    // can't clip through edges; on the ground small ledges are stepped onto.
    const tolerance = this.grounded ? s.stepHeight : 0.08;
    this.collision.resolveCircle(this.position, s.radius, this.position.y, s.height, tolerance);
    this.collision.constrain(this.position, from, s.radius);
    // Collision resolution can push sideways into another box; resolve once more.
    this.collision.resolveCircle(this.position, s.radius, this.position.y, s.height, tolerance);
    this.actualSpeed = Math.hypot(this.position.x - from.x, this.position.z - from.z) / dt;

    // Jump input is buffered briefly so a press just before landing still counts.
    if (free && intent.jump) this.jumpQueued = s.jumpBuffer;
    else this.jumpQueued = Math.max(0, this.jumpQueued - dt);

    if (this.grounded) this.coyote = s.coyoteTime;
    else this.coyote = Math.max(0, this.coyote - dt);

    if (this.jumpQueued > 0 && this.coyote > 0 && this.faceYaw === null) {
      this.verticalVelocity = s.jumpVelocity;
      this.grounded = false;
      this.coyote = 0;
      this.jumpQueued = 0;
      this.jumps += 1;
    }

    // Vertical: follow the ground, or fall.
    if (this.grounded) {
      const ground = this.collision.groundAt(this.position.x, this.position.z, this.position.y + s.stepHeight, s.supportMargin);
      if (ground >= this.position.y - s.stepHeight) {
        this.position.y = ground;
      } else {
        // Walked off a ledge.
        this.grounded = false;
        this.verticalVelocity = 0;
      }
    }
    if (!this.grounded) {
      const before = this.position.y;
      this.verticalVelocity -= s.gravity * dt;
      this.position.y += this.verticalVelocity * dt;
      // Land on any surface that was at or below the feet before this step.
      const ground = this.collision.groundAt(this.position.x, this.position.z, Math.max(before, this.position.y) + 0.02, s.supportMargin);
      if (this.verticalVelocity <= 0 && this.position.y <= ground) {
        this.lastFall = before - this.position.y;
        this.position.y = ground;
        this.verticalVelocity = 0;
        this.grounded = true;
        this.landings += 1;
      }
    }
  }

  /**
   * Interpolated state between the last two steps.
   * @param {number} alpha 0…1
   * @param {{ x: number, y: number, z: number, yaw: number }} out
   */
  interpolate(alpha, out) {
    const p = this.previous;
    out.x = p.x + (this.position.x - p.x) * alpha;
    out.y = p.y + (this.position.y - p.y) * alpha;
    out.z = p.z + (this.position.z - p.z) * alpha;
    out.yaw = p.yaw + wrapAngle(this.yaw - p.yaw) * alpha;
    return out;
  }
}

export { wrapAngle };
