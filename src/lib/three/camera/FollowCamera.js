import * as THREE from "three";

/**
 * Third-person camera behind the cat. It drives the same PerspectiveCamera as
 * the DevCamera (the engine switches which one is in control), so there is one
 * camera in the scene.
 *
 * - Sits `distance` behind and `height` above the cat, swinging round lazily
 *   to stay behind it, and looks at a point just ahead of the cat.
 * - Pulls in quickly when a building is between the cat and the camera, and
 *   eases back out once the view is clear.
 * - Blends in from wherever the camera was when it takes over.
 */

/**
 * @typedef {object} FollowSettings
 * @property {number} distance @property {number} height
 * @property {number} lookHeight @property {number} lookAhead
 * @property {number} followRate @property {number} yawRate @property {number} collisionRate
 * @property {number} collisionPadding @property {number} minDistance @property {number} groundClearance
 * @property {number} blendTime
 */

/** @param {number} rate @param {number} dt */
const approach = (rate, dt) => 1 - Math.exp(-rate * dt);

/** @param {number} a @param {number} b */
function angleDelta(a, b) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export class FollowCamera {
  /**
   * @param {THREE.PerspectiveCamera} camera
   * @param {import("@/lib/physics/CollisionWorld").CollisionWorld} collision
   * @param {FollowSettings} settings
   */
  constructor(camera, collision, settings) {
    this.camera = camera;
    this.collision = collision;
    this.settings = settings;
    this.yaw = 0;
    /** Current (possibly shortened) boom length. */
    this.boom = settings.distance;
    this.lookAt = new THREE.Vector3();
    this.desired = new THREE.Vector3();
    this.blend = 1;
    this.blendFrom = new THREE.Vector3();
    this.blendLookFrom = new THREE.Vector3();
    this.pivot = new THREE.Vector3();
    this.direction = new THREE.Vector3();
  }

  /**
   * Take control of the camera.
   * @param {{ x: number, y: number, z: number, yaw: number }} target
   * @param {{ instant?: boolean, lookFrom?: THREE.Vector3 }} [options]
   */
  activate(target, { instant = false, lookFrom } = {}) {
    this.yaw = target.yaw;
    this.boom = this.settings.distance;
    if (instant) {
      this.blend = 1;
      this.update(0, target, true);
      return;
    }
    this.blend = 0;
    this.blendFrom.copy(this.camera.position);
    if (lookFrom) this.blendLookFrom.copy(lookFrom);
    else this.camera.getWorldDirection(this.blendLookFrom).multiplyScalar(10).add(this.camera.position);
  }

  /**
   * @param {number} delta
   * @param {{ x: number, y: number, z: number, yaw: number }} target  Interpolated cat state.
   * @param {boolean} [snap]
   */
  update(delta, target, snap = false) {
    const s = this.settings;
    // Heading: lag behind the cat's yaw so turns feel weighty, not rigid.
    this.yaw += angleDelta(this.yaw, target.yaw) * (snap ? 1 : approach(s.yawRate, delta));

    const backX = -Math.sin(this.yaw);
    const backZ = -Math.cos(this.yaw);
    const horizontal = Math.hypot(s.distance, 0);
    const length = Math.hypot(s.distance, s.height);

    // Boom from a pivot above the cat towards the ideal camera position.
    this.pivot.set(target.x, target.y + 0.8, target.z);
    this.direction.set((backX * horizontal) / length, (s.height - 0.8) / length, (backZ * horizontal) / length).normalize();
    const full = Math.hypot(horizontal, s.height - 0.8);
    const hit = this.collision.raycast(this.pivot, this.direction, full, 1.4, 0.9);
    const allowed = Number.isFinite(hit) ? Math.max(s.minDistance, hit - s.collisionPadding) : full;
    const rate = allowed < this.boom ? s.collisionRate : s.followRate * 0.5;
    this.boom = snap ? allowed : this.boom + (allowed - this.boom) * approach(rate, delta);

    this.desired.copy(this.direction).multiplyScalar(this.boom).add(this.pivot);
    const floor = this.collision.heightAt(this.desired.x, this.desired.z) + s.groundClearance;
    if (this.desired.y < floor) this.desired.y = floor;

    // Look a little ahead of the cat so the path in front stays in view.
    this.lookAt.set(
      target.x + Math.sin(target.yaw) * s.lookAhead,
      target.y + s.lookHeight,
      target.z + Math.cos(target.yaw) * s.lookAhead
    );

    const camera = this.camera;
    if (snap) {
      camera.position.copy(this.desired);
    } else if (this.blend < 1) {
      // Ease in from the previous camera (e.g. after the overview).
      this.blend = Math.min(1, this.blend + delta / s.blendTime);
      const k = this.blend * this.blend * (3 - 2 * this.blend);
      camera.position.lerpVectors(this.blendFrom, this.desired, k);
      this.blendLookFrom.lerp(this.lookAt, k);
      camera.lookAt(this.blendLookFrom);
      return;
    } else {
      camera.position.lerp(this.desired, approach(s.followRate, delta));
    }
    camera.lookAt(this.lookAt);
  }
}
