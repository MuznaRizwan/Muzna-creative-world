"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CameraRigProps {
  reducedMotion?: boolean;
}

export function CameraRig({ reducedMotion = false }: CameraRigProps) {
  const targetVec = useRef(new THREE.Vector3());
  const lookAtVec = useRef(new THREE.Vector3(0, 0.2, 0));

  useFrame((state, delta) => {
    // If reduced motion is requested, maintain stable camera at baseline
    if (reducedMotion) {
      state.camera.position.lerp(new THREE.Vector3(0, 0.4, 4.5), 0.05);
      state.camera.lookAt(lookAtVec.current);
      return;
    }

    // Subtle parallax offset driven by pointer coordinates
    // pointer.x and pointer.y are normalized between -1 and 1
    const targetX = state.pointer.x * 0.45;
    const targetY = 0.4 + state.pointer.y * 0.25;
    const targetZ = 4.5 - Math.abs(state.pointer.x) * 0.15;

    targetVec.current.set(targetX, targetY, targetZ);

    // Smooth dampening factor using delta time
    const damping = Math.min(delta * 2.2, 0.1);
    state.camera.position.lerp(targetVec.current, damping);

    // Slightly lead the camera target based on mouse position
    const lookTargetX = state.pointer.x * 0.12;
    const lookTargetY = 0.2 + state.pointer.y * 0.08;
    lookAtVec.current.set(lookTargetX, lookTargetY, 0);

    state.camera.lookAt(lookAtVec.current);
  });

  return null;
}
