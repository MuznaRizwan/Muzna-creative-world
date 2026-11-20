"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ArchitecturalPlinthProps {
  reducedMotion?: boolean;
}

export function ArchitecturalPlinth({ reducedMotion = false }: ArchitecturalPlinthProps) {
  const outerRingRef = useRef<THREE.Mesh>(null!);
  const innerRingRef = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    if (!reducedMotion) {
      if (outerRingRef.current) outerRingRef.current.rotation.z += delta * 0.05;
      if (innerRingRef.current) innerRingRef.current.rotation.z -= delta * 0.08;
    }
  });

  return (
    <group position={[0, -1.2, 0]}>
      {/* Central Solid Platform */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <cylinderGeometry args={[1.5, 1.6, 0.1, 32]} />
        <meshStandardMaterial
          color="#0f1016"
          roughness={0.4}
          metalness={0.7}
        />
      </mesh>

      {/* Top Polished Dais Inset */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.42, 32]} />
        <meshStandardMaterial
          color="#161822"
          roughness={0.25}
          metalness={0.8}
        />
      </mesh>

      {/* Concentric Emissive Ring (Lavender) */}
      <mesh
        ref={outerRingRef}
        position={[0, 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[1.45, 1.48, 48]} />
        <meshStandardMaterial
          color="#c084fc"
          emissive="#a855f7"
          emissiveIntensity={0.6}
          roughness={0.2}
        />
      </mesh>

      {/* Inner Rotating Calibration Ring (Blue) */}
      <mesh
        ref={innerRingRef}
        position={[0, 0.015, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[1.05, 1.07, 48]} />
        <meshStandardMaterial
          color="#60a5fa"
          emissive="#3b82f6"
          emissiveIntensity={0.5}
          roughness={0.2}
        />
      </mesh>

      {/* Ground Shadow Receiver */}
      <mesh position={[0, -0.15, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <shadowMaterial opacity={0.35} />
      </mesh>
    </group>
  );
}
