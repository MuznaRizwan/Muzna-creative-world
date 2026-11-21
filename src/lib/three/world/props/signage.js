import * as THREE from "three";

/**
 * Timber signage: location name boards and junction signposts with arrows.
 * Lettering is cream paint on timber (Bricolage Grotesque), per the creative direction.
 */

/**
 * Arrow-shaped board geometry pointing along +x (length ≈ 1.45).
 * @param {import("../kit").Kit} kit
 */
function arrowGeometry(kit) {
  return kit.geometry("arrowBoard", () => {
    const shape = new THREE.Shape([
      new THREE.Vector2(0, -0.2),
      new THREE.Vector2(1.2, -0.2),
      new THREE.Vector2(1.45, 0),
      new THREE.Vector2(1.2, 0.2),
      new THREE.Vector2(0, 0.2),
    ]);
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.07, bevelEnabled: false });
    g.translate(0, 0, -0.035);
    return g;
  });
}

/**
 * Board on two posts with the location name, facing +z (rotate with `ry`).
 * @param {import("../kit").Kit} kit
 * @param {import("../textures").Textures} textures
 * @param {{ text: string, accent: string, width?: number, x?: number, z?: number, y?: number, ry?: number }} options
 */
export function createNameBoard(kit, textures, { text, accent, width = 2.8, x = 0, y = 0, z = 0, ry = 0 }) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.rotation.y = ry;
  const timber = kit.material("timberDark");
  for (const side of [-1, 1]) {
    kit.block(group, { w: 0.14, h: 1.75, d: 0.14, mat: timber, x: (side * width) / 2.25 });
  }
  const height = width / 4;
  kit.block(group, { w: width, h: height, d: 0.08, mat: kit.material("timber"), y: 1.05 });
  const face = kit.textured(`sign:${text}:${accent}`, textures.signBoard(text, accent));
  for (const side of [1, -1]) {
    group.add(
      kit.mesh(kit.geo.plane(), face, {
        y: 1.05 + height / 2,
        z: side * 0.045,
        ry: side === 1 ? 0 : Math.PI,
        sx: width - 0.06,
        sy: height - 0.06,
        cast: false,
      })
    );
  }
  return group;
}

/**
 * Arrow board attached to a post or trunk, pointing towards (dx, dz).
 * @param {import("../kit").Kit} kit
 * @param {import("../textures").Textures} textures
 * @param {THREE.Object3D} parent
 * @param {{ text: string, dx: number, dz: number, y: number, offset?: number }} options
 */
export function addArrowBoard(kit, textures, parent, { text, dx, dz, y, offset = 0.1 }) {
  const angle = Math.atan2(-dz, dx);
  const arm = new THREE.Group();
  arm.position.set((Math.cos(angle) * offset), y, (-Math.sin(angle) * offset));
  arm.rotation.y = angle;
  arm.add(kit.mesh(arrowGeometry(kit), kit.material("timber")));
  const label = kit.textured(`arrow:${text}`, textures.arrowLabel(text));
  arm.add(kit.mesh(kit.geo.plane(), label, { x: 0.62, z: 0.04, sx: 1.12, sy: 0.3, cast: false }));
  arm.add(kit.mesh(kit.geo.plane(), label, { x: 0.62, z: -0.04, ry: Math.PI, sx: 1.12, sy: 0.3, cast: false }));
  parent.add(arm);
  return arm;
}

/**
 * Junction signpost with one arrow per target.
 * @param {import("../kit").Kit} kit
 * @param {import("../textures").Textures} textures
 * @param {{ x: number, y: number, z: number, targets: { name: string, x: number, z: number }[] }} options
 */
export function createSignpost(kit, textures, { x, y, z, targets }) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  kit.block(group, { w: 0.16, h: 2.5, d: 0.16, mat: kit.material("timberDark") });
  kit.block(group, { w: 0.24, h: 0.1, d: 0.24, mat: kit.material("timber"), y: 2.5 });
  targets.forEach((target, i) => {
    addArrowBoard(kit, textures, group, {
      text: target.name,
      dx: target.x - x,
      dz: target.z - z,
      y: 2.15 - i * 0.48,
    });
  });
  return group;
}
