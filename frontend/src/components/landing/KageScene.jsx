import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════════════════════════
   KageScene — Original Three.js temple sanctuary
   Dark atmospheric night scene with torii gate, blood moon, stone lanterns,
   temple stairs, firefly particles, volumetric fog, and parallax camera.
   ═══════════════════════════════════════════════════════════════════════════ */

// ─── Color Palette ───────────────────────────────────────────────────────
const INK = new THREE.Color('#05070a');
const BONE = new THREE.Color('#dfe7e0');
const VERMILION = new THREE.Color('#e0231c');
const EMBER = new THREE.Color('#ff5a3c');
const DARK_WOOD = new THREE.Color('#0d1114');
const STONE = new THREE.Color('#1a1e22');
const WARM_STONE = new THREE.Color('#2a2420');
const LANTERN_GLOW = new THREE.Color('#ff6030');
const MOON_COLOR = new THREE.Color('#e83a1c');

// ─── Blood Moon ──────────────────────────────────────────────────────────
function BloodMoon() {
  const moonRef = useRef();
  const glowRef = useRef();
  const haloRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (moonRef.current) {
      moonRef.current.position.y = 4.8 + Math.sin(t * 0.15) * 0.08;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(t * 0.3) * 0.04);
    }
    if (haloRef.current) {
      haloRef.current.scale.setScalar(1 + Math.sin(t * 0.2 + 1) * 0.06);
      haloRef.current.material.opacity = 0.08 + Math.sin(t * 0.25) * 0.02;
    }
  });

  return (
    <group position={[3.5, 4.8, -12]}>
      {/* Far halo */}
      <mesh ref={haloRef}>
        <circleGeometry args={[4.5, 64]} />
        <meshBasicMaterial color={MOON_COLOR} transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
      {/* Mid glow */}
      <mesh ref={glowRef}>
        <circleGeometry args={[2.2, 64]} />
        <meshBasicMaterial color={EMBER} transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
      {/* Moon body */}
      <mesh ref={moonRef}>
        <circleGeometry args={[1.05, 64]} />
        <meshBasicMaterial color={MOON_COLOR} transparent opacity={0.92} side={THREE.DoubleSide} />
      </mesh>
      {/* Inner highlight */}
      <mesh position={[-0.15, 0.15, 0.01]}>
        <circleGeometry args={[0.65, 64]} />
        <meshBasicMaterial color={EMBER} transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ─── Torii Gate ──────────────────────────────────────────────────────────
function ToriiGate({ position = [0, 0, 0], scale = 1, color = VERMILION }) {
  const groupRef = useRef();

  const pillarGeo = useMemo(() => new THREE.BoxGeometry(0.15, 3.6, 0.15), []);
  const beamGeo = useMemo(() => new THREE.BoxGeometry(3.4, 0.14, 0.18), []);
  const topBeamGeo = useMemo(() => new THREE.BoxGeometry(3.8, 0.1, 0.14), []);
  const capGeo = useMemo(() => new THREE.BoxGeometry(4.2, 0.12, 0.2), []);

  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color,
    roughness: 0.85,
    metalness: 0.05,
    emissive: color,
    emissiveIntensity: 0.06,
  }), [color]);

  const darkMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: DARK_WOOD,
    roughness: 0.9,
    metalness: 0.0,
  }), []);

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Left pillar */}
      <mesh geometry={pillarGeo} material={mat} position={[-1.4, 1.8, 0]} />
      {/* Right pillar */}
      <mesh geometry={pillarGeo} material={mat} position={[1.4, 1.8, 0]} />
      {/* Main beam */}
      <mesh geometry={beamGeo} material={mat} position={[0, 3.4, 0]} />
      {/* Top beam */}
      <mesh geometry={topBeamGeo} material={mat} position={[0, 3.65, 0]} />
      {/* Cap / kasagi */}
      <mesh geometry={capGeo} material={darkMat} position={[0, 3.82, 0]}>
        <meshStandardMaterial color="#1a0a08" roughness={0.95} />
      </mesh>
    </group>
  );
}

// ─── Stone Lantern ───────────────────────────────────────────────────────
function StoneLantern({ position = [0, 0, 0], scale = 1, glowIntensity = 1 }) {
  const lightRef = useRef();
  const glowRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const flicker = 0.6 + Math.sin(t * 3.7) * 0.12 + Math.sin(t * 7.3) * 0.08 + Math.sin(t * 11.1) * 0.05;
    if (lightRef.current) {
      lightRef.current.intensity = flicker * 1.8 * glowIntensity;
    }
    if (glowRef.current) {
      glowRef.current.material.opacity = flicker * 0.5 * glowIntensity;
      glowRef.current.material.emissiveIntensity = flicker * 0.8;
    }
  });

  return (
    <group position={position} scale={scale}>
      {/* Base */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.3, 0.24, 0.3]} />
        <meshStandardMaterial color={STONE} roughness={0.95} />
      </mesh>
      {/* Pillar */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.65, 8]} />
        <meshStandardMaterial color={STONE} roughness={0.9} />
      </mesh>
      {/* Firebox */}
      <mesh position={[0, 1.0, 0]}>
        <boxGeometry args={[0.28, 0.3, 0.28]} />
        <meshStandardMaterial color={WARM_STONE} roughness={0.85} />
      </mesh>
      {/* Glow inside firebox */}
      <mesh ref={glowRef} position={[0, 1.0, 0.15]}>
        <planeGeometry args={[0.18, 0.18]} />
        <meshStandardMaterial
          color={LANTERN_GLOW}
          emissive={LANTERN_GLOW}
          emissiveIntensity={0.8}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 1.28, 0]}>
        <boxGeometry args={[0.38, 0.08, 0.38]} />
        <meshStandardMaterial color={STONE} roughness={0.9} />
      </mesh>
      {/* Top finial */}
      <mesh position={[0, 1.42, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color={STONE} roughness={0.9} />
      </mesh>
      {/* Point light */}
      <pointLight
        ref={lightRef}
        position={[0, 1.0, 0.1]}
        color={LANTERN_GLOW}
        intensity={1.8}
        distance={4}
        decay={2}
      />
    </group>
  );
}

// ─── Temple Steps ────────────────────────────────────────────────────────
function TempleSteps({ position = [0, 0, 0] }) {
  const steps = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 8; i++) {
      arr.push({
        y: i * 0.18,
        z: i * -0.35,
        width: 4.5 - i * 0.15,
      });
    }
    return arr;
  }, []);

  return (
    <group position={position}>
      {steps.map((step, i) => (
        <mesh key={i} position={[0, step.y, step.z]}>
          <boxGeometry args={[step.width, 0.16, 0.38]} />
          <meshStandardMaterial
            color={new THREE.Color().lerpColors(STONE, WARM_STONE, i / 8)}
            roughness={0.95}
            metalness={0.0}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── Ground Plane ────────────────────────────────────────────────────────
function GroundPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color={INK} roughness={1} metalness={0} />
    </mesh>
  );
}

// ─── Firefly Particles ───────────────────────────────────────────────────
function Fireflies({ count = 80 }) {
  const pointsRef = useRef();

  const [positions, velocities, phases] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const pha = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = Math.random() * 5 + 0.3;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12 - 2;
      vel[i * 3] = (Math.random() - 0.5) * 0.004;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.003;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.003;
      pha[i] = Math.random() * Math.PI * 2;
    }
    return [pos, vel, pha];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.elapsedTime;
    const posArr = pointsRef.current.geometry.attributes.position.array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      posArr[i3] += velocities[i3] + Math.sin(t * 0.5 + phases[i]) * 0.002;
      posArr[i3 + 1] += velocities[i3 + 1] + Math.sin(t * 0.7 + phases[i] * 2) * 0.001;
      posArr[i3 + 2] += velocities[i3 + 2] + Math.cos(t * 0.4 + phases[i]) * 0.001;

      // Wrap around bounds
      if (posArr[i3] > 8) posArr[i3] = -8;
      if (posArr[i3] < -8) posArr[i3] = 8;
      if (posArr[i3 + 1] > 6) posArr[i3 + 1] = 0.3;
      if (posArr[i3 + 1] < 0.2) posArr[i3 + 1] = 5;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ffcc88"
        size={0.04}
        sizeAttenuation
        depthWrite={false}
        opacity={0.7}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

// ─── Dust Motes ──────────────────────────────────────────────────────────
function DustParticles({ count = 300 }) {
  const pointsRef = useRef();

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = Math.random() * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 16 - 3;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={BONE}
        size={0.015}
        sizeAttenuation
        depthWrite={false}
        opacity={0.2}
      />
    </Points>
  );
}

// ─── Temple Wall / Backdrop ──────────────────────────────────────────────
function TempleWall({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {/* Main wall */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[8, 4, 0.3]} />
        <meshStandardMaterial color="#0e1216" roughness={0.95} />
      </mesh>
      {/* Roof overhang */}
      <mesh position={[0, 4.1, 0.3]} rotation={[0.25, 0, 0]}>
        <boxGeometry args={[9, 0.1, 1.8]} />
        <meshStandardMaterial color="#0a0c0f" roughness={0.9} />
      </mesh>
      {/* Roof ridge */}
      <mesh position={[0, 4.3, -0.1]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[9.2, 0.08, 0.8]} />
        <meshStandardMaterial color="#080a0d" roughness={0.9} />
      </mesh>
      {/* Left door frame */}
      <mesh position={[-1.2, 1.5, 0.16]}>
        <boxGeometry args={[0.08, 3, 0.08]} />
        <meshStandardMaterial color={WARM_STONE} roughness={0.9} />
      </mesh>
      {/* Right door frame */}
      <mesh position={[1.2, 1.5, 0.16]}>
        <boxGeometry args={[0.08, 3, 0.08]} />
        <meshStandardMaterial color={WARM_STONE} roughness={0.9} />
      </mesh>
      {/* Top door frame */}
      <mesh position={[0, 3.0, 0.16]}>
        <boxGeometry args={[2.5, 0.08, 0.08]} />
        <meshStandardMaterial color={WARM_STONE} roughness={0.9} />
      </mesh>
    </group>
  );
}

// ─── Side Trees (silhouette) ─────────────────────────────────────────────
function PineTree({ position = [0, 0, 0], scale = 1 }) {
  const layers = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 5; i++) {
      arr.push({
        y: 1.5 + i * 0.9,
        radius: 0.9 - i * 0.12,
        height: 0.7,
      });
    }
    return arr;
  }, []);

  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.06, 0.1, 2, 6]} />
        <meshStandardMaterial color="#0a0c0e" roughness={0.95} />
      </mesh>
      {/* Foliage layers */}
      {layers.map((layer, i) => (
        <mesh key={i} position={[0, layer.y, 0]}>
          <coneGeometry args={[layer.radius, layer.height, 8]} />
          <meshStandardMaterial color="#060a0d" roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Scene Camera Controller ─────────────────────────────────────────────
function CameraRig() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useFrame(() => {
    target.current.x += (mouse.current.x * 0.3 - target.current.x) * 0.03;
    target.current.y += (mouse.current.y * 0.15 - target.current.y) * 0.03;

    camera.position.x = target.current.x;
    camera.position.y = 2.4 - target.current.y * 0.3;
    camera.lookAt(0, 2.2, -5);
  });

  return null;
}

// ─── Atmospheric Fog Post ────────────────────────────────────────────────
function Atmosphere() {
  const { scene } = useThree();

  useEffect(() => {
    scene.fog = new THREE.FogExp2('#05070a', 0.045);
    scene.background = new THREE.Color('#05070a');
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  return null;
}

// ─── Large Wordmark (CODESENTINEL) ───────────────────────────────────────
function Wordmark() {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = -0.3 + Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  // Create text using simple box geometry letters as silhouette
  // Each letter is a group of thin boxes
  const letterWidth = 1.1;
  const letterHeight = 2.0;
  const thickness = 0.06;
  const spacing = 0.15;

  // Simplified geometric letter outlines for "KAGE"
  // Using basic box primitives to create letter shapes
  const letters = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: BONE,
      transparent: true,
      opacity: 0.04,
      roughness: 1,
      metalness: 0,
    });
    return mat;
  }, []);

  return (
    <group ref={groupRef} position={[0, -0.3, -8]} scale={[1.8, 1.8, 1]}>
      {/* K */}
      <group position={[-4.5, 0, 0]}>
        <mesh><boxGeometry args={[thickness, letterHeight, thickness]} /><meshStandardMaterial color={BONE} transparent opacity={0.045} /></mesh>
        <mesh position={[0.35, 0.5, 0]} rotation={[0, 0, -0.7]}><boxGeometry args={[thickness, 1.2, thickness]} /><meshStandardMaterial color={BONE} transparent opacity={0.045} /></mesh>
        <mesh position={[0.35, -0.5, 0]} rotation={[0, 0, 0.7]}><boxGeometry args={[thickness, 1.2, thickness]} /><meshStandardMaterial color={BONE} transparent opacity={0.045} /></mesh>
      </group>
      {/* A */}
      <group position={[-2.8, 0, 0]}>
        <mesh position={[-0.3, 0, 0]} rotation={[0, 0, 0.12]}><boxGeometry args={[thickness, letterHeight, thickness]} /><meshStandardMaterial color={BONE} transparent opacity={0.045} /></mesh>
        <mesh position={[0.3, 0, 0]} rotation={[0, 0, -0.12]}><boxGeometry args={[thickness, letterHeight, thickness]} /><meshStandardMaterial color={BONE} transparent opacity={0.045} /></mesh>
        <mesh position={[0, -0.1, 0]}><boxGeometry args={[0.5, thickness, thickness]} /><meshStandardMaterial color={BONE} transparent opacity={0.045} /></mesh>
      </group>
      {/* G */}
      <group position={[-1.1, 0, 0]}>
        <mesh position={[-0.3, 0, 0]}><boxGeometry args={[thickness, letterHeight, thickness]} /><meshStandardMaterial color={BONE} transparent opacity={0.045} /></mesh>
        <mesh position={[0, 0.95, 0]}><boxGeometry args={[0.65, thickness, thickness]} /><meshStandardMaterial color={BONE} transparent opacity={0.045} /></mesh>
        <mesh position={[0, -0.95, 0]}><boxGeometry args={[0.65, thickness, thickness]} /><meshStandardMaterial color={BONE} transparent opacity={0.045} /></mesh>
        <mesh position={[0.3, -0.45, 0]}><boxGeometry args={[thickness, 1.05, thickness]} /><meshStandardMaterial color={BONE} transparent opacity={0.045} /></mesh>
        <mesh position={[0.1, 0, 0]}><boxGeometry args={[0.35, thickness, thickness]} /><meshStandardMaterial color={BONE} transparent opacity={0.045} /></mesh>
      </group>
      {/* E */}
      <group position={[0.6, 0, 0]}>
        <mesh position={[-0.25, 0, 0]}><boxGeometry args={[thickness, letterHeight, thickness]} /><meshStandardMaterial color={BONE} transparent opacity={0.045} /></mesh>
        <mesh position={[0, 0.95, 0]}><boxGeometry args={[0.55, thickness, thickness]} /><meshStandardMaterial color={BONE} transparent opacity={0.045} /></mesh>
        <mesh position={[0, 0, 0]}><boxGeometry args={[0.4, thickness, thickness]} /><meshStandardMaterial color={BONE} transparent opacity={0.045} /></mesh>
        <mesh position={[0, -0.95, 0]}><boxGeometry args={[0.55, thickness, thickness]} /><meshStandardMaterial color={BONE} transparent opacity={0.045} /></mesh>
      </group>
    </group>
  );
}

// ─── Main Scene ──────────────────────────────────────────────────────────
function TempleScene() {
  return (
    <>
      <Atmosphere />
      <CameraRig />

      {/* Lighting */}
      <ambientLight intensity={0.08} color="#0a1428" />
      <directionalLight
        position={[4, 8, -10]}
        intensity={0.15}
        color="#ff4422"
      />
      {/* Faint fill from below */}
      <pointLight position={[0, 0.5, 2]} intensity={0.3} color="#1a1816" distance={8} />

      {/* Moon */}
      <BloodMoon />

      {/* Wordmark behind scene */}
      <Wordmark />

      {/* Main torii gate */}
      <ToriiGate position={[0, 0, -3]} scale={1.1} />

      {/* Distant torii gates */}
      <ToriiGate position={[-3, 0, -7]} scale={0.7} color={new THREE.Color('#8a1510')} />
      <ToriiGate position={[4.5, 0, -9]} scale={0.5} color={new THREE.Color('#6a100c')} />

      {/* Temple backdrop */}
      <TempleWall position={[0, 0, -6]} />

      {/* Steps leading up */}
      <TempleSteps position={[0, -0.1, 1]} />

      {/* Stone lanterns */}
      <StoneLantern position={[-2.2, 0, -1.5]} scale={0.8} glowIntensity={1.2} />
      <StoneLantern position={[2.2, 0, -1.5]} scale={0.8} glowIntensity={0.9} />
      <StoneLantern position={[-1.5, 0, -4.5]} scale={0.6} glowIntensity={0.6} />
      <StoneLantern position={[1.5, 0, -4.5]} scale={0.6} glowIntensity={0.7} />

      {/* Pine trees */}
      <PineTree position={[-5.5, 0, -5]} scale={1.3} />
      <PineTree position={[6, 0, -6]} scale={1.5} />
      <PineTree position={[-7, 0, -8]} scale={1.8} />
      <PineTree position={[8, 0, -10]} scale={2.0} />
      <PineTree position={[-4, 0, -10]} scale={1.0} />

      {/* Ground */}
      <GroundPlane />

      {/* Particles */}
      <Fireflies count={60} />
      <DustParticles count={200} />
    </>
  );
}

// ─── Export ──────────────────────────────────────────────────────────────
export default function KageScene() {
  return (
    <Canvas
      camera={{ position: [0, 2.4, 6], fov: 52, near: 0.1, far: 50 }}
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.8,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        background: '#05070a',
      }}
    >
      <TempleScene />
    </Canvas>
  );
}
