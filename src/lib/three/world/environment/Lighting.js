import * as THREE from "three";

import { NIGHT_PALETTE, PALETTE, RENDER } from "@/constants/world";

const DAY_GROUND_FILL = "#D9B98A";

/**
 * Golden-hour lighting: one warm low sun (the only shadow caster), a
 * lavender-sky / warm-ground hemisphere fill, and distance fog. At night the
 * same directional light becomes the moon and the fill turns cool and dim
 * (see `apply`).
 * @param {THREE.Scene} scene
 */
export function createLighting(scene) {
  // Low sun in the west-south-west (≈20° above the horizon): long shadows to the ENE.
  const sunDirection = new THREE.Vector3(-0.9, 0.36, 0.42).normalize();
  // The moon hangs in the north (≈25° up), ahead of the cat as it sets off up the boulevard.
  const moonDirection = new THREE.Vector3(0.3, 0.42, -0.86).normalize();

  // Lavender sky fill keeps shadows violet; a warm ground bounce stops sandstone turning mauve.
  const hemisphere = new THREE.HemisphereLight(PALETTE.lavenderBand, DAY_GROUND_FILL, 0.9);
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

  const day = {
    sky: new THREE.Color(PALETTE.lavenderBand),
    ground: new THREE.Color(DAY_GROUND_FILL),
    fill: 0.9,
    light: new THREE.Color(PALETTE.sun),
    intensity: 2.9,
    haze: new THREE.Color(PALETTE.haze),
  };
  const night = {
    sky: new THREE.Color(NIGHT_PALETTE.skyFill),
    ground: new THREE.Color(NIGHT_PALETTE.groundFill),
    fill: 0.8,
    light: new THREE.Color(NIGHT_PALETTE.moon),
    intensity: 1.15,
    haze: new THREE.Color(NIGHT_PALETTE.haze),
  };
  const fog = /** @type {THREE.Fog} */ (scene.fog);
  const background = /** @type {THREE.Color} */ (scene.background);
  /** Current direction towards the sun or moon (shared with the sky dome). */
  const lightDirection = sunDirection.clone();

  return {
    sunDirection,
    lightDirection,
    /**
     * Blend between golden hour (0) and night (1).
     * @param {number} t
     */
    apply(t) {
      hemisphere.color.lerpColors(day.sky, night.sky, t);
      hemisphere.groundColor.lerpColors(day.ground, night.ground, t);
      hemisphere.intensity = THREE.MathUtils.lerp(day.fill, night.fill, t);
      sun.color.lerpColors(day.light, night.light, t);
      // Dip through dusk so the sun-to-moon swing doesn't sweep bright shadows across the island.
      sun.intensity = THREE.MathUtils.lerp(day.intensity, night.intensity, t) * (1 - 0.6 * Math.sin(Math.PI * t));
      lightDirection.copy(sunDirection).lerp(moonDirection, t).normalize();
      sun.position.copy(lightDirection).multiplyScalar(110);
      fog.color.lerpColors(day.haze, night.haze, t);
      background.copy(fog.color);
    },
    dispose() {
      sun.shadow.map?.dispose();
      sun.dispose();
      hemisphere.dispose();
    },
  };
}
