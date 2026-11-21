import * as THREE from "three";

import { PALETTE } from "@/constants/world";

/**
 * Golden-hour sky dome: zenith → lavender band → peach horizon, with a soft
 * glow around the low sun. Follows the camera so it never clips.
 * @param {import("../kit").Kit} kit
 * @param {THREE.Vector3} sunDirection Normalised direction towards the sun.
 */
export function createSky(kit, sunDirection) {
  const material = kit.tracker.track(
    new THREE.ShaderMaterial({
      name: "sky",
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        zenith: { value: new THREE.Color(PALETTE.zenith) },
        band: { value: new THREE.Color(PALETTE.lavenderBand) },
        horizon: { value: new THREE.Color(PALETTE.horizon) },
        haze: { value: new THREE.Color(PALETTE.haze) },
        sun: { value: new THREE.Color(PALETTE.sun) },
        sunDirection: { value: sunDirection.clone().normalize() },
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
        varying vec3 vDirection;
        void main() {
          vec3 dir = normalize(vDirection);
          float h = dir.y;
          vec3 color = mix(haze, horizon, smoothstep(-0.05, 0.03, h));
          color = mix(color, band, smoothstep(0.03, 0.28, h));
          color = mix(color, zenith, smoothstep(0.28, 0.85, h));
          float facing = max(dot(dir, sunDirection), 0.0);
          color += sun * (pow(facing, 220.0) * 1.2 + pow(facing, 12.0) * 0.28);
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
