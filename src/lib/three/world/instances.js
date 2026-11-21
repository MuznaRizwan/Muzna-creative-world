import * as THREE from "three";

/**
 * Repeated small objects (trees, grass, lamps, bulbs, stones, columns…) are
 * collected here while the world is assembled and become one InstancedMesh
 * per type at the end: one draw call per type instead of one per object.
 *
 * @param {import("./kit").Kit} kit
 */
export function createInstanceTypes(kit) {
  const { geo, material } = kit;
  return {
    canopy: { geometry: geo.sphere(1), material: material("foliage"), cast: true },
    trunk: { geometry: geo.cylinder(0.65, 1, 6), material: material("timber"), cast: true },
    cypress: { geometry: geo.sphere(1), material: material("foliage"), cast: true },
    palmTrunk: { geometry: geo.cylinder(0.7, 1, 6), material: material("timber"), cast: true },
    palmFrond: { geometry: geo.cone(4), material: material("foliage"), cast: true },
    grass: { geometry: geo.cone(4), material: material("foliage"), cast: false },
    lavender: { geometry: geo.sphere(0), material: material("foliage"), cast: false },
    flower: { geometry: geo.sphere(0), material: material("foliage"), cast: false },
    bougainvillea: { geometry: geo.sphere(1), material: material("foliage"), cast: true },
    shrub: { geometry: geo.sphere(1), material: material("foliage"), cast: true },
    rock: { geometry: geo.sphere(0), material: kit.colour("#ffffff", { flatShading: true }), cast: true },
    stone: { geometry: geo.box(), material: material("tinted"), cast: true },
    lampPost: { geometry: geo.cylinder(0.75, 1, 6), material: material("iron"), cast: true },
    lampHead: { geometry: geo.box(), material: material("lanternGlass"), cast: false },
    banner: { geometry: geo.plane(), material: material("cloth"), cast: true },
    bulb: { geometry: geo.sphere(0), material: material("bulb"), cast: false },
    column: { geometry: geo.cylinder(0.85, 1, 10), material: material("limewash"), cast: true },
    ring: {
      geometry: kit.geometry("interactRing", () => new THREE.RingGeometry(0.82, 1, 40).rotateX(-Math.PI / 2)),
      material: kit.colour("#ffffff", { transparent: true, opacity: 0.45, depthWrite: false }),
      cast: false,
    },
    lantern: { geometry: geo.box(), material: material("lanternGlass"), cast: false },
  };
}

/** @typedef {ReturnType<typeof createInstanceTypes>} InstanceTypes */
/** @typedef {keyof InstanceTypes} InstanceType */

/**
 * @typedef {object} InstanceOptions
 * @property {number} [rx] @property {number} [ry] @property {number} [rz]
 * @property {number} [scale] Uniform scale.
 * @property {[number, number, number]} [size] Non-uniform scale.
 * @property {string | THREE.Color} [color]
 */

export class InstanceBuckets {
  /** @param {InstanceTypes} types */
  constructor(types) {
    this.types = types;
    /** @type {Map<string, { matrices: THREE.Matrix4[], colors: (THREE.Color | null)[] }>} */
    this.buckets = new Map();
    this.dummy = new THREE.Object3D();
  }

  /**
   * @param {InstanceType} type
   * @param {number} x @param {number} y @param {number} z
   * @param {InstanceOptions} [options]
   */
  add(type, x, y, z, options = {}) {
    const { rx = 0, ry = 0, rz = 0, scale = 1, size, color } = options;
    const dummy = this.dummy;
    dummy.position.set(x, y, z);
    dummy.rotation.set(rx, ry, rz);
    if (size) dummy.scale.set(size[0], size[1], size[2]);
    else dummy.scale.setScalar(scale);
    dummy.updateMatrix();

    let bucket = this.buckets.get(type);
    if (!bucket) {
      bucket = { matrices: [], colors: [] };
      this.buckets.set(type, bucket);
    }
    bucket.matrices.push(dummy.matrix.clone());
    bucket.colors.push(color ? new THREE.Color(color) : null);
  }

  /**
   * Create one InstancedMesh per collected type.
   * @returns {THREE.InstancedMesh[]}
   */
  build() {
    /** @type {THREE.InstancedMesh[]} */
    const meshes = [];
    for (const [type, bucket] of this.buckets) {
      const definition = this.types[/** @type {InstanceType} */ (type)];
      const count = bucket.matrices.length;
      const mesh = new THREE.InstancedMesh(definition.geometry, definition.material, count);
      mesh.name = `instances:${type}`;
      mesh.castShadow = definition.cast;
      mesh.receiveShadow = true;
      const white = new THREE.Color("#ffffff");
      const hasColors = bucket.colors.some(Boolean);
      for (let i = 0; i < count; i += 1) {
        mesh.setMatrixAt(i, bucket.matrices[i]);
        if (hasColors) mesh.setColorAt(i, bucket.colors[i] ?? white);
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.computeBoundingSphere();
      meshes.push(mesh);
    }
    this.buckets.clear();
    return meshes;
  }
}
