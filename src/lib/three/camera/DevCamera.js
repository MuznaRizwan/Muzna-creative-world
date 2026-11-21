import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/**
 * Temporary development camera: free orbit/pan/zoom plus smooth fly-to presets
 * for inspecting the world. The final third-person cat camera replaces it later.
 */
export class DevCamera {
  /** @param {HTMLCanvasElement} domElement */
  constructor(domElement) {
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    this.camera.position.set(0, 60, 76);

    this.controls = new OrbitControls(this.camera, domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    // Close enough to inspect the cat (0.95 tall) up close.
    this.controls.minDistance = 0.8;
    this.controls.maxDistance = 170;
    this.controls.maxPolarAngle = Math.PI * 0.48;
    this.controls.target.set(0, 0, -2);
    this.controls.update();

    /** @type {null | { fromPos: THREE.Vector3, toPos: THREE.Vector3, fromTarget: THREE.Vector3, toTarget: THREE.Vector3, t: number, duration: number }} */
    this.tween = null;
    this.cancelTween = () => {
      this.tween = null;
    };
    // Any manual drag/zoom interrupts a running fly-to.
    this.controls.addEventListener("start", this.cancelTween);
  }

  /** @param {number} aspect */
  setAspect(aspect) {
    this.camera.aspect = aspect;
    // Portrait phones get a wider view so the world stays readable.
    this.camera.fov = aspect < 0.8 ? 55 : 45;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Fly to a camera position looking at a target.
   * @param {THREE.Vector3} position
   * @param {THREE.Vector3} target
   * @param {{ duration?: number, instant?: boolean }} [options]
   */
  flyTo(position, target, { duration = 1.2, instant = false } = {}) {
    if (instant) {
      this.tween = null;
      this.camera.position.copy(position);
      this.controls.target.copy(target);
      this.controls.update();
      return;
    }
    this.tween = {
      fromPos: this.camera.position.clone(),
      toPos: position.clone(),
      fromTarget: this.controls.target.clone(),
      toTarget: target.clone(),
      t: 0,
      duration,
    };
  }

  /** @param {number} delta */
  update(delta) {
    const tween = this.tween;
    if (tween) {
      tween.t = Math.min(1, tween.t + delta / tween.duration);
      const k = tween.t < 0.5 ? 4 * tween.t ** 3 : 1 - (-2 * tween.t + 2) ** 3 / 2;
      this.camera.position.lerpVectors(tween.fromPos, tween.toPos, k);
      this.controls.target.lerpVectors(tween.fromTarget, tween.toTarget, k);
      if (tween.t >= 1) this.tween = null;
    }
    this.controls.update(delta);
  }

  dispose() {
    this.controls.removeEventListener("start", this.cancelTween);
    this.controls.dispose();
  }
}
