"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticleFieldProps {
  count?: number;
  reducedMotion?: boolean;
}

export function ParticleField({ count = 120, reducedMotion = false }: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null!);

  // Generate deterministic particle positions distributed in a 3D box around the stage
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const colorLavender = new THREE.Color("#c084fc");
    const colorBlue = new THREE.Color("#818cf8");
    const colorPink = new THREE.Color("#f472b6");
    const palette = [colorLavender, colorBlue, colorPink];

    for (let i = 0; i < count; i++) {
      // Spatial distribution [-3.5, 3.5] on X, [-1.5, 2.5] on Y, [-2.5, 2.5] on Z
      pos[i * 3 + 0] = (Math.random() - 0.5) * 7;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 4 + 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5;

      const chosenColor = palette[i % palette.length];
      col[i * 3 + 0] = chosenColor.r;
      col[i * 3 + 1] = chosenColor.g;
      col[i * 3 + 2] = chosenColor.b;
    }

    return [pos, col];
  }, [count]);

  useFrame((state, delta) => {
    if (reducedMotion || !pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.015) * 0.02;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        vertexColors
        transparent
        opacity={0.65}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
