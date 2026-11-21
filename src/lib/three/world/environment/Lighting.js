import * as THREE from "three";

import { PALETTE, RENDER } from "@/constants/world";

/**
 * Golden-hour lighting: one warm low sun (the only shadow caster), a
 * lavender-sky / warm-ground hemisphere fill, and distance fog.
 * @param {THREE.Scene} scene
 */
export function createLighting(scene) {
  // Low sun in the west-south-west (≈20° above the horizon): long shadows to the ENE.
  const sunDirection = new THREE.Vector3(-0.9, 0.36, 0.42).normalize();

  // Lavender sky fill keeps shadows violet; a warm ground bounce stops sandstone turning mauve.
  const hemisphere = new THREE.HemisphereLight(PALETTE.lavenderBand, "#D9B98A", 0.9);
  hemisphere.name = "sky-fill";

  const sun = new THREE.DirectionalLight(PALETTE.sun, 2.9);
  sun.name = "sun";
  sun.position.copy(sunDirection).multiplyScalar(110);
  sun.target.position.set(0, 0, 0);
  sun.castShadow = true;

  const coarse = window.matchMedia?.("(pointer: coarse)").matches;
  const size = coarse ? RENDER.shadowMapSizeMobile : RENDER.shadowMapSize;
  sun.shadow.mapSize.set(size, size);
  const shadowCamera = /** @type {THREE.OrthographicCamera} */ (sun.shadow.camera);
  shadowCamera.left = -50;
  shadowCamera.right = 50;
  shadowCamera.top = 50;
  shadowCamera.bottom = -50;
  shadowCamera.near = 40;
  shadowCamera.far = 190;
  shadowCamera.updateProjectionMatrix();
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.04;

  scene.fog = new THREE.Fog(PALETTE.haze, RENDER.fogNear, RENDER.fogFar);
  scene.background = new THREE.Color(PALETTE.haze);

  scene.add(hemisphere, sun, sun.target);

  return {
    sunDirection,
    dispose() {
      sun.shadow.map?.dispose();
      sun.dispose();
      hemisphere.dispose();
    },
  };
}
