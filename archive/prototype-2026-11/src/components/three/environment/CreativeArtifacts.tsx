"use client";

import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

interface CreativeArtifactsProps {
  reducedMotion?: boolean;
}

export function CreativeArtifacts({ reducedMotion = false }: CreativeArtifactsProps) {
  // Central Crystal Prism
  const prismRef = useRef<THREE.Mesh>(null!);
  const [prismHovered, setPrismHovered] = useState(false);

  // Gimbal Ring References
  const gimbalXRef = useRef<THREE.Mesh>(null!);
  const gimbalYRef = useRef<THREE.Mesh>(null!);
  const gimbalZRef = useRef<THREE.Mesh>(null!);

  // Architectural Viewport Drafting Slabs
  const slabLeftRef = useRef<THREE.Group>(null!);
  const slabRightRef = useRef<THREE.Group>(null!);
  const [slabLeftHovered, setSlabLeftHovered] = useState(false);
  const [slabRightHovered, setSlabRightHovered] = useState(false);

  useFrame((state, delta) => {
    if (reducedMotion) return;

    const time = state.clock.elapsedTime;

    // Central Prism Rotation (accelerates slightly when hovered)
    if (prismRef.current) {
      const rotSpeed = prismHovered ? 0.7 : 0.3;
      prismRef.current.rotation.y += delta * rotSpeed;
      prismRef.current.rotation.x = Math.sin(time * 0.4) * 0.15;

      // Smooth scale interpolation on hover
      const targetScale = prismHovered ? 1.08 : 1.0;
      prismRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        delta * 6
      );
    }

    // Gimbal Axes (representative of 3D transforms & rigging)
    if (gimbalXRef.current) gimbalXRef.current.rotation.x += delta * 0.2;
    if (gimbalYRef.current) gimbalYRef.current.rotation.y += delta * 0.25;
    if (gimbalZRef.current) gimbalZRef.current.rotation.z += delta * 0.18;

    // Architectural Slab Float & Tilt
    if (slabLeftRef.current) {
      const targetRotY = slabLeftHovered ? 0.4 : 0.25;
      slabLeftRef.current.rotation.y = THREE.MathUtils.lerp(
        slabLeftRef.current.rotation.y,
        targetRotY + Math.sin(time * 0.5) * 0.05,
        delta * 3
      );
      slabLeftRef.current.position.y = THREE.MathUtils.lerp(
        slabLeftRef.current.position.y,
        0.3 + Math.sin(time * 0.6) * 0.08,
        delta * 3
      );
    }

    if (slabRightRef.current) {
      const targetRotY = slabRightHovered ? -0.4 : -0.28;
      slabRightRef.current.rotation.y = THREE.MathUtils.lerp(
        slabRightRef.current.rotation.y,
        targetRotY - Math.cos(time * 0.45) * 0.05,
        delta * 3
      );
      slabRightRef.current.position.y = THREE.MathUtils.lerp(
        slabRightRef.current.position.y,
        -0.1 + Math.cos(time * 0.55) * 0.08,
        delta * 3
      );
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Central Focal Workspace Artifact: Interactive Geometric Prism */}
      <Float
        speed={reducedMotion ? 0 : 2}
        rotationIntensity={reducedMotion ? 0 : 0.4}
        floatIntensity={reducedMotion ? 0 : 0.6}
        position={[0, 0.1, 0]}
      >
        <mesh
          ref={prismRef}
          castShadow
          receiveShadow
          onPointerOver={(e) => {
            e.stopPropagation();
            setPrismHovered(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setPrismHovered(false);
            document.body.style.cursor = "auto";
          }}
        >
          <dodecahedronGeometry args={[0.75, 0]} />
          <meshStandardMaterial
            color={prismHovered ? "#a5b4fc" : "#818cf8"}
            emissive={prismHovered ? "#6366f1" : "#3730a3"}
            emissiveIntensity={prismHovered ? 0.7 : 0.3}
            roughness={0.2}
            metalness={0.7}
            wireframe={false}
          />
        </mesh>

        {/* Subtle Outer Wireframe Halo around Prism */}
        <mesh>
          <icosahedronGeometry args={[0.95, 0]} />
          <meshStandardMaterial
            color="#c084fc"
            wireframe
            transparent
            opacity={0.3}
          />
        </mesh>

        {/* Orbiting Gimbal Coordinate Ring 1 (Lavender) */}
        <mesh ref={gimbalXRef}>
          <torusGeometry args={[1.25, 0.015, 16, 64]} />
          <meshStandardMaterial
            color="#c084fc"
            emissive="#a855f7"
            emissiveIntensity={0.5}
            roughness={0.3}
          />
        </mesh>

        {/* Orbiting Gimbal Coordinate Ring 2 (Pink) */}
        <mesh ref={gimbalYRef} rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[1.4, 0.012, 16, 64]} />
          <meshStandardMaterial
            color="#f472b6"
            emissive="#ec4899"
            emissiveIntensity={0.4}
            roughness={0.3}
          />
        </mesh>

        {/* Orbiting Gimbal Coordinate Ring 3 (Blue) */}
        <mesh ref={gimbalZRef} rotation={[0, Math.PI / 4, Math.PI / 2]}>
          <torusGeometry args={[1.55, 0.01, 16, 64]} />
          <meshStandardMaterial
            color="#60a5fa"
            emissive="#3b82f6"
            emissiveIntensity={0.4}
            roughness={0.3}
          />
        </mesh>
      </Float>

      {/* 2. Abstract Architectural Slabs: Digital Viewport Drafting Planes */}
      {/* Left Floating Slab */}
      <group
        ref={slabLeftRef}
        position={[-1.75, 0.3, -0.6]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setSlabLeftHovered(true);
        }}
        onPointerOut={() => setSlabLeftHovered(false)}
      >
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.9, 1.3, 0.04]} />
          <meshStandardMaterial
            color="#12131d"
            roughness={0.2}
            metalness={0.8}
            transparent
            opacity={0.9}
          />
        </mesh>

        {/* Glowing Edge Border on Left Slab */}
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(0.9, 1.3, 0.04)]} />
          <lineBasicMaterial
            color={slabLeftHovered ? "#818cf8" : "#3730a3"}
            linewidth={1}
          />
        </lineSegments>

        {/* Decorative Grid Line inside Left Slab */}
        <mesh position={[0, 0, 0.025]}>
          <planeGeometry args={[0.7, 1.1]} />
          <meshBasicMaterial
            color="#6366f1"
            wireframe
            transparent
            opacity={slabLeftHovered ? 0.35 : 0.15}
          />
        </mesh>
      </group>

      {/* Right Floating Slab */}
      <group
        ref={slabRightRef}
        position={[1.8, -0.1, -0.7]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setSlabRightHovered(true);
        }}
        onPointerOut={() => setSlabRightHovered(false)}
      >
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.85, 1.1, 0.04]} />
          <meshStandardMaterial
            color="#15121b"
            roughness={0.2}
            metalness={0.8}
            transparent
            opacity={0.9}
          />
        </mesh>

        {/* Glowing Edge Border on Right Slab */}
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(0.85, 1.1, 0.04)]} />
          <lineBasicMaterial
            color={slabRightHovered ? "#f472b6" : "#831843"}
            linewidth={1}
          />
        </lineSegments>

        {/* Decorative Grid Line inside Right Slab */}
        <mesh position={[0, 0, 0.025]}>
          <planeGeometry args={[0.65, 0.9]} />
          <meshBasicMaterial
            color="#f472b6"
            wireframe
            transparent
            opacity={slabRightHovered ? 0.35 : 0.15}
          />
        </mesh>
      </group>

      {/* 3. Spatial Anchor Nodes (Diamonds / Octahedra hovering in space) */}
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
        {[
          { pos: [-1.2, 1.4, -0.2], color: "#c084fc", emissive: "#a855f7" },
          { pos: [1.3, 1.2, 0.3], color: "#60a5fa", emissive: "#3b82f6" },
          { pos: [0.9, -0.8, 0.8], color: "#f472b6", emissive: "#ec4899" },
          { pos: [-1.4, -0.7, 0.4], color: "#818cf8", emissive: "#6366f1" },
        ].map((node, i) => (
          <mesh key={i} position={node.pos as [number, number, number]}>
            <octahedronGeometry args={[0.08, 0]} />
            <meshStandardMaterial
              color={node.color}
              emissive={node.emissive}
              emissiveIntensity={0.6}
              roughness={0.3}
            />
          </mesh>
        ))}
      </Float>
    </group>
  );
}
