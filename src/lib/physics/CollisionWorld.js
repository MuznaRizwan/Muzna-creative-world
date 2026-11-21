/**
 * Static collision data for the custom physics: the terrain height function,
 * axis-aligned collider boxes from the world builder, the walkable boundary
 * and extra walkways (the pier). Plain maths only — no Three.js — so the same
 * queries serve the character controller, the camera and future triggers.
 */

/**
 * @typedef {object} Box
 * @property {number} minX @property {number} maxX
 * @property {number} minY @property {number} maxY
 * @property {number} minZ @property {number} maxZ
 */

/**
 * A rectangular walkway that extends the walkable area beyond the boundary
 * (e.g. the pier). `angle` is the world direction it runs along (atan2(z, x)).
 * @typedef {object} Walkway
 * @property {number} x Start of the centre line.
 * @property {number} z
 * @property {number} angle
 * @property {number} length
 * @property {number} width
 * @property {number} y Height of the deck surface.
 */

/**
 * @typedef {object} CollisionWorldOptions
 * @property {Box[]} colliders
 * @property {(x: number, z: number) => number} heightAt Terrain height.
 * @property {(x: number, z: number, margin: number) => boolean} isInside Walkable boundary test.
 * @property {(x: number, z: number, margin: number) => { x: number, z: number }} nearestInside Closest point inside the boundary (with margin).
 * @property {Walkway[]} [walkways]
 * @property {number} [cellSize]
 */

export class CollisionWorld {
  /** @param {CollisionWorldOptions} options */
  constructor({ colliders, heightAt, isInside, nearestInside, walkways = [], cellSize = 4 }) {
    this.colliders = colliders;
    this.heightAt = heightAt;
    this.isInside = isInside;
    this.nearestInside = nearestInside;
    this.walkways = walkways;
    this.cellSize = cellSize;
    /** @type {Map<string, Box[]>} Uniform grid broadphase. */
    this.grid = new Map();
    for (const box of colliders) {
      const [x0, z0] = this.cell(box.minX, box.minZ);
      const [x1, z1] = this.cell(box.maxX, box.maxZ);
      for (let cx = x0; cx <= x1; cx += 1) {
        for (let cz = z0; cz <= z1; cz += 1) {
          const key = `${cx},${cz}`;
          const list = this.grid.get(key);
          if (list) list.push(box);
          else this.grid.set(key, [box]);
        }
      }
    }
    /** @type {Set<Box>} */
    this.seen = new Set();
    /** @type {Box[]} */
    this.scratch = [];
  }

  /** @param {number} x @param {number} z @returns {[number, number]} */
  cell(x, z) {
    return [Math.floor(x / this.cellSize), Math.floor(z / this.cellSize)];
  }

  /**
   * Colliders whose footprint may touch the given rectangle. The returned
   * array is reused between calls.
   * @param {number} minX @param {number} minZ @param {number} maxX @param {number} maxZ
   */
  query(minX, minZ, maxX, maxZ) {
    const out = this.scratch;
    out.length = 0;
    this.seen.clear();
    const [x0, z0] = this.cell(minX, minZ);
    const [x1, z1] = this.cell(maxX, maxZ);
    for (let cx = x0; cx <= x1; cx += 1) {
      for (let cz = z0; cz <= z1; cz += 1) {
        const list = this.grid.get(`${cx},${cz}`);
        if (!list) continue;
        for (const box of list) {
          if (this.seen.has(box)) continue;
          this.seen.add(box);
          out.push(box);
        }
      }
    }
    return out;
  }

  /**
   * Highest surface under a character at (x, z) that it can stand on: the
   * terrain, or the top of a box no higher than `maxTop`. A box supports the
   * character once its centre is within `support` of the box footprint.
   * @param {number} x @param {number} z
   * @param {number} maxTop Highest surface the character may snap onto.
   * @param {number} support
   */
  groundAt(x, z, maxTop, support) {
    let ground = this.heightAt(x, z);
    for (const way of this.walkways) {
      if (way.y > ground && way.y <= maxTop && this.onWalkway(x, z, 0, way)) ground = way.y;
    }
    for (const box of this.query(x - support, z - support, x + support, z + support)) {
      if (box.maxY > maxTop || box.maxY <= ground) continue;
      if (x < box.minX - support || x > box.maxX + support || z < box.minZ - support || z > box.maxZ + support) continue;
      ground = box.maxY;
    }
    return ground;
  }

  /**
   * Push a vertical cylinder (circle in plan) out of every box it overlaps.
   * Boxes whose top is at or below `feetY + stepHeight` are ignored (they can
   * be stepped onto), as are boxes entirely above the character's head.
   * Mutates `position` and returns whether any contact happened.
   * @param {{ x: number, z: number }} position
   * @param {number} radius
   * @param {number} feetY
   * @param {number} height
   * @param {number} stepHeight
   */
  resolveCircle(position, radius, feetY, height, stepHeight) {
    let hit = false;
    for (let iteration = 0; iteration < 3; iteration += 1) {
      let moved = false;
      const boxes = this.query(position.x - radius, position.z - radius, position.x + radius, position.z + radius);
      for (const box of boxes) {
        if (box.maxY <= feetY + stepHeight || box.minY >= feetY + height) continue;
        const cx = Math.max(box.minX, Math.min(position.x, box.maxX));
        const cz = Math.max(box.minZ, Math.min(position.z, box.maxZ));
        const dx = position.x - cx;
        const dz = position.z - cz;
        const distSq = dx * dx + dz * dz;
        if (distSq >= radius * radius) continue;
        if (distSq > 1e-10) {
          const dist = Math.sqrt(distSq);
          const push = radius - dist;
          position.x += (dx / dist) * push;
          position.z += (dz / dist) * push;
        } else {
          // Centre inside the box: leave by the nearest face.
          const left = position.x - box.minX;
          const right = box.maxX - position.x;
          const back = position.z - box.minZ;
          const front = box.maxZ - position.z;
          const least = Math.min(left, right, back, front);
          if (least === left) position.x = box.minX - radius;
          else if (least === right) position.x = box.maxX + radius;
          else if (least === back) position.z = box.minZ - radius;
          else position.z = box.maxZ + radius;
        }
        moved = true;
        hit = true;
      }
      if (!moved) break;
    }
    return hit;
  }

  /**
   * Is (x, z) on a walkway (the pier)? Checks one walkway, or all of them.
   * @param {number} x @param {number} z @param {number} margin @param {Walkway} [only]
   */
  onWalkway(x, z, margin, only) {
    for (const way of only ? [only] : this.walkways) {
      const ax = Math.cos(way.angle);
      const az = Math.sin(way.angle);
      const rx = x - way.x;
      const rz = z - way.z;
      const along = rx * ax + rz * az;
      const across = Math.abs(-rx * az + rz * ax);
      if (along > -1 && along < way.length - margin && across < way.width / 2 - margin) return true;
    }
    return false;
  }

  /**
   * Keep a character inside the walkable area (inside the boundary wall, or
   * on a walkway). When the new position is outside, it is projected back onto
   * the boundary, which keeps the movement along the wall (sliding) and removes
   * the part going through it. `from` is the last valid position.
   * @param {{ x: number, z: number }} position Mutated.
   * @param {{ x: number, z: number }} from
   * @param {number} margin
   * @returns {boolean} Whether the position was corrected.
   */
  constrain(position, from, margin) {
    if (this.isInside(position.x, position.z, margin) || this.onWalkway(position.x, position.z, margin)) return false;
    // Leaving a walkway sideways: keep whichever axis stays on it.
    if (this.onWalkway(from.x, from.z, margin)) {
      if (this.onWalkway(position.x, from.z, margin)) position.z = from.z;
      else if (this.onWalkway(from.x, position.z, margin)) position.x = from.x;
      else {
        position.x = from.x;
        position.z = from.z;
      }
      return true;
    }
    const edge = this.nearestInside(position.x, position.z, margin);
    if (this.isInside(edge.x, edge.z, margin)) {
      position.x = edge.x;
      position.z = edge.z;
    } else {
      position.x = from.x;
      position.z = from.z;
    }
    return true;
  }

  /**
   * Nearest hit distance of a ray against the collider boxes, or Infinity.
   * Used by the follow camera to avoid clipping into buildings.
   * @param {{ x: number, y: number, z: number }} origin
   * @param {{ x: number, y: number, z: number }} direction Normalised.
   * @param {number} maxDistance
   * @param {number} [minHeight] Ignore boxes lower than this (benches, planters).
   * @param {number} [minWidth] Ignore boxes thinner than this both ways (posts, trunks).
   */
  raycast(origin, direction, maxDistance, minHeight = 0, minWidth = 0) {
    const endX = origin.x + direction.x * maxDistance;
    const endZ = origin.z + direction.z * maxDistance;
    let nearest = Infinity;
    const boxes = this.query(Math.min(origin.x, endX), Math.min(origin.z, endZ), Math.max(origin.x, endX), Math.max(origin.z, endZ));
    for (const box of boxes) {
      if (box.maxY - box.minY < minHeight) continue;
      if (box.maxX - box.minX < minWidth && box.maxZ - box.minZ < minWidth) continue;
      const t = rayBox(origin, direction, box);
      if (t !== null && t < nearest && t <= maxDistance) nearest = t;
    }
    return nearest;
  }

  /**
   * Is a character-sized cylinder at (x, z) free of blocking boxes?
   * @param {number} x @param {number} z @param {number} radius @param {number} feetY @param {number} height @param {number} stepHeight
   */
  isFree(x, z, radius, feetY, height, stepHeight) {
    if (!this.isInside(x, z, radius) && !this.onWalkway(x, z, radius)) return false;
    for (const box of this.query(x - radius, z - radius, x + radius, z + radius)) {
      if (box.maxY <= feetY + stepHeight || box.minY >= feetY + height) continue;
      const cx = Math.max(box.minX, Math.min(x, box.maxX));
      const cz = Math.max(box.minZ, Math.min(z, box.maxZ));
      if ((x - cx) ** 2 + (z - cz) ** 2 < radius * radius) return false;
    }
    return true;
  }

  /**
   * Closest free spot to (x, z), searched on growing rings.
   * @param {number} x @param {number} z @param {number} radius @param {number} height @param {number} stepHeight
   */
  findFreeSpot(x, z, radius, height, stepHeight) {
    for (let ring = 0; ring <= 12; ring += 1) {
      const r = ring * 0.5;
      const samples = ring === 0 ? 1 : 8 + ring * 4;
      for (let i = 0; i < samples; i += 1) {
        const a = (i / samples) * Math.PI * 2;
        const px = x + Math.cos(a) * r;
        const pz = z + Math.sin(a) * r;
        const feet = this.groundAt(px, pz, this.heightAt(px, pz) + stepHeight, 0);
        if (this.isFree(px, pz, radius, feet, height, stepHeight)) return { x: px, z: pz };
      }
    }
    return { x, z };
  }
}

/**
 * Slab-method ray/box intersection. Returns the entry distance (0 when the
 * origin is inside) or null.
 * @param {{ x: number, y: number, z: number }} o
 * @param {{ x: number, y: number, z: number }} d
 * @param {Box} b
 */
function rayBox(o, d, b) {
  let tMin = 0;
  let tMax = Infinity;
  for (const [origin, dir, min, max] of /** @type {const} */ ([
    [o.x, d.x, b.minX, b.maxX],
    [o.y, d.y, b.minY, b.maxY],
    [o.z, d.z, b.minZ, b.maxZ],
  ])) {
    if (Math.abs(dir) < 1e-9) {
      if (origin < min || origin > max) return null;
      continue;
    }
    let t1 = (min - origin) / dir;
    let t2 = (max - origin) / dir;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);
    if (tMin > tMax) return null;
  }
  return tMin;
}
