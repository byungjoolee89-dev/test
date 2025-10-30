import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Transaction } from '../types/transaction';

interface ParticleData {
  id: string;
  position: number; // 0 to 1, position along the tube
  color: THREE.Color;
  speed: number;
  transaction: Transaction;
  createdAt: number;
}

interface ParticleFlowChart3DProps {
  transactions: Transaction[];
}

// Tube geometry component
function FlowTube() {
  const tubeRef = useRef<THREE.Mesh>(null);

  // Create a curved path for the tube
  const path = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-10, 0, 0),
      new THREE.Vector3(-5, 0.5, 0),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(5, -0.5, 0),
      new THREE.Vector3(10, 0, 0)
    ]);
    return curve;
  }, []);

  const tubeGeometry = useMemo(() => {
    return new THREE.TubeGeometry(path, 100, 1.5, 16, false);
  }, [path]);

  return (
    <mesh ref={tubeRef} geometry={tubeGeometry}>
      <meshStandardMaterial
        color="#667eea"
        transparent
        opacity={0.15}
        side={THREE.DoubleSide}
        wireframe={false}
      />
    </mesh>
  );
}

// Wireframe tube for visual guide
function WireframeTube() {
  const path = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-10, 0, 0),
      new THREE.Vector3(-5, 0.5, 0),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(5, -0.5, 0),
      new THREE.Vector3(10, 0, 0)
    ]);
    return curve;
  }, []);

  const tubeGeometry = useMemo(() => {
    return new THREE.TubeGeometry(path, 100, 1.5, 16, false);
  }, [path]);

  return (
    <lineSegments>
      <edgesGeometry args={[tubeGeometry]} />
      <lineBasicMaterial color="#667eea" transparent opacity={0.3} />
    </lineSegments>
  );
}

// Particle system component
function ParticleSystem({ transactions }: { transactions: Transaction[] }) {
  const particlesRef = useRef<THREE.InstancedMesh>(null);
  const particleDataRef = useRef<ParticleData[]>([]);
  const maxParticles = 200;

  // Create the path for particles to follow
  const path = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-10, 0, 0),
      new THREE.Vector3(-5, 0.5, 0),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(5, -0.5, 0),
      new THREE.Vector3(10, 0, 0)
    ]);
  }, []);

  // Get color based on transaction status
  const getColor = (status: string): THREE.Color => {
    switch (status) {
      case 'success':
        return new THREE.Color('#10b981'); // green
      case 'slow':
        return new THREE.Color('#f59e0b'); // orange
      case 'error':
        return new THREE.Color('#ef4444'); // red
      default:
        return new THREE.Color('#6b7280'); // gray
    }
  };

  // Initialize particles from transactions
  useEffect(() => {
    const now = Date.now();
    const recentTransactions = transactions.filter(tx => now - tx.timestamp < 60000);

    // Add new transactions as particles
    recentTransactions.forEach(tx => {
      // Check if particle already exists
      const exists = particleDataRef.current.find(p => p.id === tx.id);
      if (!exists && particleDataRef.current.length < maxParticles) {
        const timeSinceCreation = now - tx.timestamp;
        const initialPosition = Math.min(timeSinceCreation / 10000, 1); // Move across in 10 seconds

        particleDataRef.current.push({
          id: tx.id,
          position: initialPosition,
          color: getColor(tx.status),
          speed: 0.001 + (tx.responseTime / 5000) * 0.002, // Slower for slower transactions
          transaction: tx,
          createdAt: tx.timestamp
        });
      }
    });

    // Remove old particles
    particleDataRef.current = particleDataRef.current.filter(p => {
      return p.position < 1.2 && (now - p.createdAt) < 70000;
    });
  }, [transactions]);

  // Animation loop
  useFrame((state, delta) => {
    if (!particlesRef.current) return;

    const dummy = new THREE.Object3D();

    particleDataRef.current.forEach((particle, i) => {
      // Update position
      particle.position += particle.speed;

      // Get position on path
      const point = path.getPoint(Math.min(particle.position, 1));
      const tangent = path.getTangent(Math.min(particle.position, 1));

      // Add some random motion perpendicular to path
      const time = state.clock.elapsedTime;
      const perpendicular = new THREE.Vector3(-tangent.y, tangent.x, 0);
      const offset = perpendicular.multiplyScalar(
        Math.sin(time * 2 + i * 0.5) * 0.3
      );

      dummy.position.copy(point).add(offset);

      // Scale based on response time (bigger for slower transactions)
      const scale = 0.15 + (particle.transaction.responseTime / 5000) * 0.15;
      dummy.scale.set(scale, scale, scale);

      dummy.updateMatrix();
      particlesRef.current!.setMatrixAt(i, dummy.matrix);
      particlesRef.current!.setColorAt(i, particle.color);
    });

    // Fill remaining instances with invisible particles
    for (let i = particleDataRef.current.length; i < maxParticles; i++) {
      dummy.position.set(0, -1000, 0); // Move offscreen
      dummy.scale.set(0, 0, 0);
      dummy.updateMatrix();
      particlesRef.current.setMatrixAt(i, dummy.matrix);
    }

    particlesRef.current.instanceMatrix.needsUpdate = true;
    if (particlesRef.current.instanceColor) {
      particlesRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={particlesRef} args={[undefined, undefined, maxParticles]}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial />
    </instancedMesh>
  );
}

// Main component
export default function ParticleFlowChart3D({ transactions }: ParticleFlowChart3DProps) {
  return (
    <div style={{ width: '100%', height: '600px', background: '#f9fafb', borderRadius: '12px' }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 8, 15]} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={10}
          maxDistance={30}
        />

        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        <pointLight position={[0, 0, 0]} intensity={0.5} />

        {/* Grid helper for reference */}
        <gridHelper args={[30, 30, '#e5e7eb', '#f3f4f6']} position={[0, -3, 0]} />

        {/* Tube and particles */}
        <FlowTube />
        <WireframeTube />
        <ParticleSystem transactions={transactions} />

        {/* Axes helper for debugging */}
        {/* <axesHelper args={[5]} /> */}
      </Canvas>
    </div>
  );
}
