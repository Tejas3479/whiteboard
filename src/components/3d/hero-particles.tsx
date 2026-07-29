"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

function Particles() {
  const ref = useRef<THREE.Points>(null);
  const { mouse, viewport } = useThree();

  const particleCount = 250;
  
  const positions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 15; // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5 - 2; // z
    }
    return positions;
  }, []);

  const velocities = useMemo(() => {
    const velocities = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    return velocities;
  }, []);

  const originalPositions = useMemo(() => new Float32Array(positions), [positions]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    
    // Convert normalized mouse coordinates to world space coordinates
    const targetX = (mouse.x * viewport.width) / 2;
    const targetY = (mouse.y * viewport.height) / 2;
    
    const positions = ref.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Basic drift
      positions[i3] += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];

      // Mouse repulsion
      const dx = targetX - positions[i3];
      const dy = targetY - positions[i3 + 1];
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 3) {
        const force = (3 - dist) / 3;
        positions[i3] -= dx * force * 0.05;
        positions[i3 + 1] -= dy * force * 0.05;
      }
      
      // Return to original bounds gently
      if (Math.abs(positions[i3] - originalPositions[i3]) > 5) {
        velocities[i3] *= -1;
      }
      if (Math.abs(positions[i3 + 1] - originalPositions[i3 + 1]) > 5) {
        velocities[i3 + 1] *= -1;
      }
      
      // Slow rotation for the entire field
      ref.current.rotation.x -= delta / 30;
      ref.current.rotation.y -= delta / 45;
    }
    
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#8b5cf6"
        size={0.06}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  );
}

export default function HeroParticles() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-[1]">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <Particles />
      </Canvas>
    </div>
  );
}
