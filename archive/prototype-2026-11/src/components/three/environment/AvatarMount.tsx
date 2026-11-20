"use client";

import React, { useRef, useState, useEffect, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface AvatarMountProps {
  reducedMotion?: boolean;
}

// Actual Blender GLB Avatar renderer (used when exported asset is detected)
function LoadedAvatarModel({ url }: { url: string }) {
  const gltf = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <primitive
      ref={groupRef}
      object={gltf.scene}
      position={[0, -1.15, 0]}
      scale={[1.4, 1.4, 1.4]}
      castShadow
      receiveShadow
    />
  );
}

// Stage Marker / Calibration Socket (shown while Blender asset is in production)
function StandbyStageSocket({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const beaconRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    if (reducedMotion) return;
    if (beaconRef.current) {
      beaconRef.current.rotation.y += delta * 0.4;
      beaconRef.current.position.y = -1.1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.03;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Surface Calibration Target on the Plinth */}
      <mesh position={[0, -1.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.33, 32]} />
        <meshBasicMaterial color="#818cf8" transparent opacity={0.4} />
      </mesh>

      {/* Floating Calibration Focus Diamond */}
      <mesh ref={beaconRef} position={[0, -1.1, 0]}>
        <octahedronGeometry args={[0.07, 0]} />
        <meshStandardMaterial
          color="#818cf8"
          emissive="#6366f1"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </group>
  );
}

export function AvatarMount({ reducedMotion = false }: AvatarMountProps) {
  const [modelAvailable, setModelAvailable] = useState(false);

  useEffect(() => {
    // Check if the exported custom avatar model file exists in public/models/
    fetch("/models/muzna-avatar.glb", { method: "HEAD" })
      .then((res) => {
        if (res.ok) setModelAvailable(true);
      })
      .catch(() => setModelAvailable(false));
  }, []);

  if (modelAvailable) {
    return (
      <Suspense fallback={<StandbyStageSocket reducedMotion={reducedMotion} />}>
        <LoadedAvatarModel url="/models/muzna-avatar.glb" />
      </Suspense>
    );
  }

  return <StandbyStageSocket reducedMotion={reducedMotion} />;
}
