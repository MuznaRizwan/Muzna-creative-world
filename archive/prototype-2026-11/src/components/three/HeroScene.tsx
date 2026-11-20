"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { RotateCcw, Box, Sparkles, Eye, Zap, AlertTriangle } from "lucide-react";
import { StudioLighting } from "./environment/StudioLighting";
import { CameraRig } from "./environment/CameraRig";
import { ArchitecturalPlinth } from "./environment/ArchitecturalPlinth";
import { CreativeArtifacts } from "./environment/CreativeArtifacts";
import { ParticleField } from "./environment/ParticleField";
import { AvatarMount } from "./environment/AvatarMount";

// WebGL Compatibility Detection Helper
function checkWebGLSupport(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

// Fallback Display when WebGL is unavailable
function WebGLFallback() {
  return (
    <div className="w-full h-full min-h-[380px] sm:min-h-[460px] lg:min-h-[520px] rounded-3xl border border-neutral-800 bg-neutral-950 flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
        <Box className="w-8 h-8" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-white">Interactive 3D Workspace</h3>
        <p className="text-xs text-neutral-400 max-w-xs">
          Hardware WebGL acceleration is currently unavailable in this browser environment.
        </p>
      </div>
      <span className="text-[11px] font-mono text-neutral-500">
        3D Avatar &bull; Studio Stage
      </span>
    </div>
  );
}

// Loading Skeleton while Three.js initializes
function CanvasLoader() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950/70 backdrop-blur-sm z-20 pointer-events-none space-y-3">
      <div className="w-10 h-10 rounded-xl border border-indigo-500/30 bg-indigo-500/10 flex items-center justify-center animate-pulse">
        <Box className="w-5 h-5 text-indigo-400 animate-spin" />
      </div>
      <span className="text-xs font-mono text-neutral-400">Loading 3D Workspace...</span>
    </div>
  );
}

export function HeroScene() {
  const [hasWebGL, setHasWebGL] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    // 1. Check WebGL availability
    setHasWebGL(checkWebGLSupport());

    // 2. Check user's OS reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleMotionChange);
    setIsLoaded(true);

    return () => mediaQuery.removeEventListener("change", handleMotionChange);
  }, []);

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  if (!hasWebGL) {
    return <WebGLFallback />;
  }

  return (
    <div className="w-full h-full min-h-[380px] sm:min-h-[460px] lg:min-h-[520px] relative rounded-3xl overflow-hidden border border-neutral-800/80 bg-gradient-to-b from-neutral-900/40 via-neutral-950/70 to-neutral-950 shadow-2xl backdrop-blur-sm group select-none">
      {/* 3D Scene Controls UI Overlay (Top Bar) */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-neutral-900/85 border border-neutral-800 text-neutral-300 backdrop-blur-md shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Interactive 3D Workspace
        </span>
      </div>

      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {/* Reduced Motion Toggle Button */}
        <button
          onClick={() => setReducedMotion(!reducedMotion)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all border cursor-pointer ${
            reducedMotion
              ? "bg-purple-950/70 border-purple-500/40 text-purple-300"
              : "bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-white"
          }`}
          title="Toggle Reduced Motion mode"
        >
          {reducedMotion ? "Motion: Reduced" : "Motion: Dynamic"}
        </button>

        {/* Auto-Rotate Toggle Button */}
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all border cursor-pointer ${
            autoRotate
              ? "bg-indigo-950/70 border-indigo-500/40 text-indigo-300"
              : "bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-white"
          }`}
          title="Toggle Auto Rotation"
        >
          {autoRotate ? "Rotate: ON" : "Rotate: OFF"}
        </button>

        {/* Reset Camera View */}
        <button
          onClick={resetCamera}
          className="p-1.5 rounded-lg bg-neutral-900/80 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          title="Reset Camera View"
          aria-label="Reset Camera View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* R3F WebGL Canvas */}
      <Suspense fallback={<CanvasLoader />}>
        <Canvas
          shadows
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
          camera={{ position: [0, 0.4, 4.5], fov: 45 }}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          <PerspectiveCamera makeDefault position={[0, 0.4, 4.5]} fov={45} />

          {/* 1. Studio Lighting System (Three-Point Setup) */}
          <StudioLighting />

          {/* 2. Mouse Parallax Rig (Smooth cursor tracking) */}
          <CameraRig reducedMotion={reducedMotion} />

          {/* 3. Architectural Pedestal / Studio Dais */}
          <ArchitecturalPlinth reducedMotion={reducedMotion} />

          {/* 4. Creative Digital Workspace Artifacts (Prism, Slabs, Gimbals) */}
          <CreativeArtifacts reducedMotion={reducedMotion} />

          {/* 5. Spatial Depth Micro-Particles */}
          <ParticleField count={100} reducedMotion={reducedMotion} />

          {/* 6. Modular Avatar Socket (Seamlessly receives Blender avatar) */}
          <AvatarMount reducedMotion={reducedMotion} />

          {/* 7. Orbital Controls with Constrained Polar Angles */}
          <OrbitControls
            ref={controlsRef}
            enablePan={false}
            enableZoom={true}
            minDistance={2.8}
            maxDistance={6.0}
            maxPolarAngle={Math.PI / 2 + 0.08}
            minPolarAngle={Math.PI / 4}
            autoRotate={autoRotate && !reducedMotion}
            autoRotateSpeed={1.0}
            dampingFactor={0.05}
          />
        </Canvas>
      </Suspense>

      {/* Bottom Interactive Hint Overlay */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none text-[11px] font-mono text-neutral-500">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          Interactive: Mouse Parallax &bull; Hover Artifacts &bull; Drag to Orbit
        </span>
        <span className="hidden sm:inline-block text-neutral-600">
          Avatar Stage: public/models/muzna-avatar.glb
        </span>
      </div>
    </div>
  );
}
