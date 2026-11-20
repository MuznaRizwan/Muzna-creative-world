"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";

interface SceneContainerProps {
  children?: React.ReactNode;
}

export function SceneContainer({ children }: SceneContainerProps) {
  return (
    <div className="w-full h-full min-h-[300px] relative">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: true }}
        className="w-full h-full"
      >
        <PerspectiveCamera makeDefault position={[0, 1.5, 4]} fov={50} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />

        <Suspense fallback={null}>
          {children}
        </Suspense>

        <OrbitControls
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minDistance={2}
          maxDistance={7}
        />
      </Canvas>
    </div>
  );
}
