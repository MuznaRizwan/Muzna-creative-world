import * as THREE from "three";

import { PALETTE } from "@/constants/world";

/**
 * Shared material definitions. Everything is matte (painted-model look):
 * roughness ~0.9, metalness 0, except real metal and glass.
 * @type {Record<string, THREE.MeshStandardMaterialParameters>}
 */
const MATERIALS = {
  grass: { color: PALETTE.meadow },
  grassShade: { color: PALETTE.meadowShade },
  earth: { color: PALETTE.earth },
  beach: { color: PALETTE.beach },
  path: { color: PALETTE.sandstone },
  kerb: { color: PALETTE.kerb },
  honey: { color: PALETTE.honey },
  limewash: { color: PALETTE.limewash },
  terracotta: { color: PALETTE.terracotta },
  terracottaDeep: { color: PALETTE.terracottaDeep },
  timber: { color: PALETTE.timber },
  timberDark: { color: PALETTE.timberDark },
  iron: { color: PALETTE.iron, roughness: 0.6, metalness: 0.3 },
  water: { color: PALETTE.lagoon, roughness: 0.32 },
  glass: {
    color: "#d8eeee",
    roughness: 0.08,
    transparent: true,
    opacity: 0.26,
    depthWrite: false,
    side: THREE.DoubleSide,
  },
  copper: { color: PALETTE.verdigris, roughness: 0.5, metalness: 0.35 },
  brass: { color: PALETTE.brass, roughness: 0.4, metalness: 0.6 },
  opening: { color: "#2b2230", roughness: 1 },
  warmOpening: { color: "#5a3826", emissive: "#ffb46b", emissiveIntensity: 0.45 },
  bulb: { color: "#fff1cf", emissive: PALETTE.lamp, emissiveIntensity: 2.2 },
  lanternGlass: { color: "#fff0c8", emissive: "#ffc46b", emissiveIntensity: 1.6 },
  /** White base: per-instance colours tint foliage, stones and flowers. */
  tinted: { color: "#ffffff" },
  foliage: { color: "#ffffff", flatShading: true },
  cloth: { color: "#ffffff", side: THREE.DoubleSide, roughness: 1 },
  paper: { color: PALETTE.paper },
  ink: { color: PALETTE.ink },
  inkBlue: { color: PALETTE.inkBlue },
  velvet: { color: PALETTE.crimson, roughness: 1 },
  periwinkle: { color: PALETTE.periwinkle },
  coral: { color: PALETTE.coral },
  postRed: { color: PALETTE.postRed },
  rose: { color: PALETTE.rose },
  marigold: { color: PALETTE.marigold },
  truckTeal: { color: PALETTE.truckTeal },
  cushion: { color: PALETTE.lavenderFlower },
  clay: { color: "#d8c3a5", flatShading: true },
};

/**
 * The world-building kit: cached materials, geometries and small mesh helpers.
 * Everything it creates is registered with the tracker and shared between
 * objects; nothing here is disposed individually.
 *
 * @param {import("../utils/ResourceTracker").ResourceTracker} tracker
 * @param {{ fontFamily: string }} options
 */
export function createKit(tracker, { fontFamily }) {
  /** @type {Map<string, THREE.Material>} */
  const materials = new Map();
  /** @type {Map<string, THREE.BufferGeometry>} */
  const geometries = new Map();

  /**
   * @param {string} name
   * @returns {THREE.MeshStandardMaterial}
   */
  function material(name) {
    let cached = materials.get(name);
    if (!cached) {
      const definition = MATERIALS[name];
      if (!definition) throw new Error(`Unknown material "${name}"`);
      cached = tracker.track(new THREE.MeshStandardMaterial({ roughness: 0.9, metalness: 0, ...definition }));
      cached.name = name;
      materials.set(name, cached);
    }
    return /** @type {THREE.MeshStandardMaterial} */ (cached);
  }

  /**
   * Matte material in an arbitrary colour (district accents etc.).
   * @param {string} hex
   * @param {THREE.MeshStandardMaterialParameters} [extra]
   */
  function colour(hex, extra = {}) {
    const key = `colour:${hex}:${JSON.stringify(extra)}`;
    let cached = materials.get(key);
    if (!cached) {
      cached = tracker.track(new THREE.MeshStandardMaterial({ color: hex, roughness: 0.9, metalness: 0, ...extra }));
      materials.set(key, cached);
    }
    return /** @type {THREE.MeshStandardMaterial} */ (cached);
  }

  /**
   * Material with a canvas texture (signs, screens, posters). Cached by key.
   * @param {string} key
   * @param {() => THREE.Texture} createTexture
   * @param {THREE.MeshStandardMaterialParameters} [extra]
   */
  function textured(key, createTexture, extra = {}) {
    const id = `tex:${key}`;
    let cached = materials.get(id);
    if (!cached) {
      cached = tracker.track(new THREE.MeshStandardMaterial({ map: createTexture(), roughness: 0.85, metalness: 0, ...extra }));
      materials.set(id, cached);
    }
    return /** @type {THREE.MeshStandardMaterial} */ (cached);
  }

  /**
   * @param {string} key
   * @param {() => THREE.BufferGeometry} create
   */
  function geometry(key, create) {
    let cached = geometries.get(key);
    if (!cached) {
      cached = tracker.track(create());
      geometries.set(key, cached);
    }
    return cached;
  }

  const geo = {
    /** Unit cube; size it with mesh scale. */
    box: () => geometry("box", () => new THREE.BoxGeometry(1, 1, 1)),
    /** @param {number} radiusTop @param {number} radiusBottom @param {number} [segments] */
    cylinder: (radiusTop, radiusBottom, segments = 16) =>
      geometry(`cyl:${radiusTop}:${radiusBottom}:${segments}`, () => new THREE.CylinderGeometry(radiusTop, radiusBottom, 1, segments)),
    /** @param {number} [detail] */
    sphere: (detail = 1) => geometry(`ico:${detail}`, () => new THREE.IcosahedronGeometry(1, detail)),
    /** @param {number} [segments] */
    cone: (segments = 8) => geometry(`cone:${segments}`, () => new THREE.ConeGeometry(1, 1, segments)),
    /** Unit plane facing +z. */
    plane: () => geometry("plane", () => new THREE.PlaneGeometry(1, 1)),
    /** Triangular prism: base 1 wide on y=0, apex at y=1, length 1 along z. */
    prism: () =>
      geometry("prism", () => {
        const shape = new THREE.Shape([new THREE.Vector2(-0.5, 0), new THREE.Vector2(0.5, 0), new THREE.Vector2(0, 1)]);
        const g = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false });
        g.translate(0, 0, -0.5);
        return g;
      }),
    /** Right-angled prism: vertical face at x=0, slope down to x=1, length 1 along z. */
    tooth: () =>
      geometry("tooth", () => {
        const shape = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(0, 1)]);
        const g = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false });
        g.translate(0, 0, -0.5);
        return g;
      }),
    /** Half torus (arch) in the XY plane. @param {number} radius @param {number} tube */
    arch: (radius, tube) =>
      geometry(`arch:${radius}:${tube}`, () => new THREE.TorusGeometry(radius, tube, 6, 18, Math.PI)),
    /** Flat disc facing up. @param {number} [segments] */
    disc: (segments = 48) =>
      geometry(`disc:${segments}`, () => new THREE.CircleGeometry(1, segments).rotateX(-Math.PI / 2)),
  };

  /**
   * @typedef {object} Placement
   * @property {number} [x] @property {number} [y] @property {number} [z]
   * @property {number} [rx] @property {number} [ry] @property {number} [rz]
   * @property {number} [sx] @property {number} [sy] @property {number} [sz]
   * @property {boolean} [cast] @property {boolean} [receive]
   */

  /**
   * @param {THREE.BufferGeometry} geometryRef
   * @param {THREE.Material | THREE.Material[]} materialRef
   * @param {Placement} [placement]
   */
  function mesh(geometryRef, materialRef, placement = {}) {
    const { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1, cast = true, receive = true } = placement;
    const object = new THREE.Mesh(geometryRef, materialRef);
    object.position.set(x, y, z);
    object.rotation.set(rx, ry, rz);
    object.scale.set(sx, sy, sz);
    object.castShadow = cast;
    object.receiveShadow = receive;
    return object;
  }

  /**
   * Box resting on y (its base), sized w × h × d.
   * @param {THREE.Object3D} parent
   * @param {{ w: number, h: number, d: number, mat: THREE.Material } & Placement} options
   */
  function block(parent, { w, h, d, mat, y = 0, ...rest }) {
    const object = mesh(geo.box(), mat, { ...rest, y: y + h / 2, sx: w, sy: h, sz: d });
    parent.add(object);
    return object;
  }

  /**
   * Cylinder resting on y, radius r (or rTop/rBottom ratio), height h.
   * @param {THREE.Object3D} parent
   * @param {{ r: number, h: number, mat: THREE.Material, taper?: number, segments?: number } & Placement} options
   */
  function cylinder(parent, { r, h, mat, taper = 1, segments = 16, y = 0, ...rest }) {
    const object = mesh(geo.cylinder(taper, 1, segments), mat, { ...rest, y: y + h / 2, sx: r, sy: h, sz: r });
    parent.add(object);
    return object;
  }

  return { tracker, fontFamily, material, colour, textured, geometry, geo, mesh, block, cylinder };
}

/** @typedef {ReturnType<typeof createKit>} Kit */
