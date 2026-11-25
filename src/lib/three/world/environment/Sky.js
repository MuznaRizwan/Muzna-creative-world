import * as THREE from "three";

import { NIGHT_PALETTE, PALETTE } from "@/constants/world";

const DAY = {
  zenith: new THREE.Color(PALETTE.zenith),
  band: new THREE.Color(PALETTE.lavenderBand),
  horizon: new THREE.Color(PALETTE.horizon),
  haze: new THREE.Color(PALETTE.haze),
  sun: new THREE.Color(PALETTE.sun),
};
const NIGHT = {
  zenith: new THREE.Color(NIGHT_PALETTE.zenith),
  band: new THREE.Color(NIGHT_PALETTE.band),
  horizon: new THREE.Color(NIGHT_PALETTE.horizon),
  haze: new THREE.Color(NIGHT_PALETTE.haze),
  sun: new THREE.Color(NIGHT_PALETTE.moon),
};

/**
 * Sky dome. Golden hour: zenith → lavender band → peach horizon, with a soft
 * glow around the low sun. Night: deep indigo with stars and a small moon.
 * Follows the camera so it never clips.
 * @param {import("../kit").Kit} kit
 * @param {THREE.Vector3} lightDirection Normalised direction towards the sun or moon; read live.
 */
export function createSky(kit, lightDirection) {
  const material = kit.tracker.track(
    new THREE.ShaderMaterial({
      name: "sky",
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        zenith: { value: DAY.zenith.clone() },
        band: { value: DAY.band.clone() },
        horizon: { value: DAY.horizon.clone() },
        haze: { value: DAY.haze.clone() },
        sun: { value: DAY.sun.clone() },
        sunDirection: { value: lightDirection },
        night: { value: 0 },
      },
      vertexShader: /* glsl */ `
        varying vec3 vDirection;
        void main() {
          vDirection = normalize(position);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 zenith;
        uniform vec3 band;
        uniform vec3 horizon;
        uniform vec3 haze;
        uniform vec3 sun;
        uniform vec3 sunDirection;
        uniform float night;
        varying vec3 vDirection;

        float hash(vec3 p) {
          p = fract(p * 0.3183099 + 0.1);
          p *= 17.0;
          return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
        }

        void main() {
          vec3 dir = normalize(vDirection);
          float h = dir.y;
          vec3 color = mix(haze, horizon, smoothstep(-0.05, 0.03, h));
          color = mix(color, band, smoothstep(0.03, 0.28, h));
          color = mix(color, zenith, smoothstep(0.28, 0.85, h));
          float facing = max(dot(dir, sunDirection), 0.0);
          float sunGlow = pow(facing, 220.0) * 1.2 + pow(facing, 12.0) * 0.28;
          float moonGlow = smoothstep(0.99955, 0.99972, facing) * 1.1 + pow(facing, 90.0) * 0.12;
          color += sun * mix(sunGlow, moonGlow, night);

          if (night > 0.0) {
            // Stars: one possible star per cell of a fine grid on the sky, fading towards the horizon.
            vec3 p = dir * 260.0;
            vec3 cell = floor(p);
            float pick = hash(cell);
            float dotShape = smoothstep(0.42, 0.05, length(fract(p) - 0.5));
            float bright = 0.55 + 0.45 * hash(cell + 7.31);
            float star = step(0.985, pick) * dotShape * bright * smoothstep(0.04, 0.3, h);
            color += vec3(0.92, 0.94, 1.0) * star * night * (1.0 - smoothstep(0.9993, 0.9996, facing));
          }

          gl_FragColor = vec4(color, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
    })
  );
  const sky = new THREE.Mesh(
    kit.geometry("skyDome", () => new THREE.SphereGeometry(450, 32, 16)),
    material
  );
  sky.name = "sky";
  sky.frustumCulled = false;
  sky.userData.dynamic = true;
  return sky;
}

/**
 * Blend the sky between golden hour (0) and night (1).
 * @param {THREE.Mesh} sky
 * @param {number} t
 */
export function blendSky(sky, t) {
  const { uniforms } = /** @type {THREE.ShaderMaterial} */ (sky.material);
  for (const key of /** @type {const} */ (["zenith", "band", "horizon", "haze", "sun"])) {
    uniforms[key].value.lerpColors(DAY[key], NIGHT[key], t);
  }
  uniforms.night.value = t;
}
