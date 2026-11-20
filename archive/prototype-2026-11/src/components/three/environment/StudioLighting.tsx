"use client";

import React from "react";

export function StudioLighting() {
  return (
    <>
      {/* Base Ambient Illumination - low intensity to preserve rich shadows */}
      <ambientLight intensity={0.7} color="#18181b" />

      {/* Key Light: Cool Lavender / White from high top-right */}
      <directionalLight
        position={[4, 6, 4]}
        intensity={1.6}
        color="#e0e7ff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={15}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-bias={-0.0005}
      />

      {/* Fill Light: Soft Cyan / Blue from low front-left to soften harsh shadows */}
      <directionalLight
        position={[-5, 2, 3]}
        intensity={0.9}
        color="#818cf8"
      />

      {/* Accent / Rim Light: Subtle Vibrant Pink from behind-below to create silhouette separation */}
      <directionalLight
        position={[0, 3, -5]}
        intensity={1.2}
        color="#f472b6"
      />

      {/* Ground Bounce Light: Warm subtle tint bouncing off the pedestal */}
      <pointLight
        position={[0, -1, 1]}
        intensity={0.6}
        color="#c084fc"
        distance={6}
      />
    </>
  );
}
