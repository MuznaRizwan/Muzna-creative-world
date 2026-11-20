"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  Float,
  MeshDistortMaterial,
  Sphere,
  Torus,
  Html,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";
import { RotateCcw, Box, Sparkles } from "lucide-react";

// Procedural 3D Avatar & Interactive Geometric Core (Fallback when GLB is pending)
function ProceduralInteractiveAvatar() {
  const coreRef = useRef<THREE.Mesh>(null!);
  const ringRef1 = useRef<THREE.Mesh>(null!);
  const ringRef2 = useRef<THREE.Mesh>(null!);
  const particlesRef = useRef<THREE.Group>(null!);

  useFrame((state, delta) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.4;
      coreRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
    if (ringRef1.current) {
      ringRef1.current.rotation.x += delta * 0.3;
      ringRef1.current.rotation.y += delta * 0.5;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.y -= delta * 0.35;
      ringRef2.current.rotation.z += delta * 0.25;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y -= delta * 0.15;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <Float speed={2} rotationIntensity={0.6} floatIntensity={0.8}>
        {/* Central Core Shape */}
        <mesh ref={coreRef} castShadow receiveShadow>
          <icosahedronGeometry args={[1.1, 1]} />
          <meshStandardMaterial
            color="#818cf8"
            roughness={0.25}
            metalness={0.65}
            wireframe={false}
          />
        </mesh>

        {/* Inner Distorted Aura Sphere */}
        <Sphere args={[0.9, 32, 32]}>
          <MeshDistortMaterial
            color="#c084fc"
            distort={0.35}
            speed={2}
            roughness={0.2}
            metalness={0.4}
            transparent
            opacity={0.8}
          />
        </Sphere>

        {/* Orbiting Orbital Torus Rings */}
        <Torus ref={ringRef1} args={[1.6, 0.03, 16, 64]}>
          <meshStandardMaterial
            color="#f472b6"
            emissive="#ec4899"
            emissiveIntensity={0.4}
            roughness={0.3}
          />
        </Torus>

        <Torus ref={ringRef2} args={[1.9, 0.025, 16, 64]} rotation={[Math.PI / 3, 0, 0]}>
          <meshStandardMaterial
            color="#60a5fa"
            emissive="#3b82f6"
            emissiveIntensity={0.3}
            roughness={0.3}
          />
        </Torus>
      </Float>

      {/* Orbiting particle nodes */}
      <group ref={particlesRef}>
        {[
          [1.5, 1.2, 0.5],
          [-1.4, -0.9, 0.8],
          [0.8, -1.5, -0.6],
          [-0.7, 1.6, -0.9],
        ].map((pos, idx) => (
          <mesh key={idx} position={pos as [number, number, number]}>
            <octahedronGeometry args={[0.08, 0]} />
            <meshStandardMaterial
              color={idx % 2 === 0 ? "#c084fc" : "#60a5fa"}
              emissive={idx % 2 === 0 ? "#a855f7" : "#3b82f6"}
              emissiveIntensity={0.6}
            />
          </mesh>
        ))}
      </group>

      {/* Ground Shadow Plane */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <shadowMaterial opacity={0.3} />
      </mesh>
    </group>
  );
}

// Custom Avatar Loader Component (attempts to load glb model if present)
function AvatarModelLoader({ url }: { url: string }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Check if the file actually exists before R3F tries to load it
    fetch(url, { method: "HEAD" })
      .then((res) => {
        if (!res.ok) setHasError(true);
      })
      .catch(() => setHasError(true));
  }, [url]);

  if (hasError) {
    return <ProceduralInteractiveAvatar />;
  }

  return (
    <React.Suspense fallback={<ProceduralInteractiveAvatar />}>
      <ActualGLTFModel url={url} onError={() => setHasError(true)} />
    </React.Suspense>
  );
}

function ActualGLTFModel({ url, onError }: { url: string; onError: () => void }) {
  try {
    const gltf = useGLTF(url);
    const modelRef = useRef<THREE.Group>(null!);

    useFrame((_, delta) => {
      if (modelRef.current) {
        modelRef.current.rotation.y += delta * 0.2;
      }
    });

    return (
      <primitive
        ref={modelRef}
        object={gltf.scene}
        position={[0, -1.2, 0]}
        scale={[1.5, 1.5, 1.5]}
      />
    );
  } catch {
    onError();
    return <ProceduralInteractiveAvatar />;
  }
}

export function AvatarCanvas() {
  const [autoRotate, setAutoRotate] = useState(true);
  const controlsRef = useRef<any>(null);

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="w-full h-full min-h-[380px] sm:min-h-[460px] lg:min-h-[520px] relative rounded-3xl overflow-hidden border border-neutral-800/80 bg-gradient-to-b from-neutral-900/40 via-neutral-950/70 to-neutral-950 shadow-2xl backdrop-blur-sm group">
      {/* 3D Scene Controls UI Overlay */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-neutral-900/80 border border-neutral-800 text-neutral-300 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Interactive 3D Stage
        </span>
      </div>

      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-3 py-1 rounded-lg text-xs font-mono transition-all border ${
            autoRotate
              ? "bg-indigo-950/70 border-indigo-500/40 text-indigo-300"
              : "bg-neutral-900/70 border-neutral-800 text-neutral-400 hover:text-white"
          }`}
          title="Toggle Auto Rotation"
        >
          {autoRotate ? "Auto-Rotate: ON" : "Auto-Rotate: OFF"}
        </button>

        <button
          onClick={resetCamera}
          className="p-1.5 rounded-lg bg-neutral-900/70 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
          title="Reset Camera View"
          aria-label="Reset Camera View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* R3F WebGL Canvas */}
      <Canvas
        shadows
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <PerspectiveCamera makeDefault position={[0, 0.4, 4.2]} fov={45} />

        {/* Ambient & Directional Lighting tailored for character / avatar rendering */}
        <ambientLight intensity={0.8} />
        {/* Soft Lavender Key Light */}
        <directionalLight position={[4, 5, 4]} intensity={1.5} color="#e0e7ff" castShadow />
        {/* Subtle Blue Fill Light */}
        <directionalLight position={[-4, 2, -2]} intensity={0.9} color="#93c5fd" />
        {/* Subtle Pink Rim Light from behind */}
        <directionalLight position={[0, 4, -4]} intensity={1.2} color="#f472b6" />

        {/* Avatar Model Loader / Interactive Procedural Avatar */}
        <AvatarModelLoader url="/models/muzna-avatar.glb" />

        {/* Orbit Controls */}
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableZoom={true}
          minDistance={2.5}
          maxDistance={6.5}
          maxPolarAngle={Math.PI / 2 + 0.1}
          minPolarAngle={Math.PI / 4}
          autoRotate={autoRotate}
          autoRotateSpeed={1.2}
          dampingFactor={0.05}
        />
      </Canvas>

      {/* Bottom Hint */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none text-[11px] font-mono text-neutral-500">
        <span className="flex items-center gap-1.5">
          <Box className="w-3 h-3 text-indigo-400" />
          Drag to rotate &bull; Scroll to zoom
        </span>
        <span className="hidden sm:inline-block text-neutral-600">
          Target: public/models/muzna-avatar.glb
        </span>
      </div>
    </div>
  );
}
