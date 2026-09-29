import { useRef, useEffect } from 'react';
import * as THREE from 'three';

/**
 * ThreeBackground
 *
 * Full-screen, fixed-position Three.js scene rendered behind page content.
 * Features: 50 geometric shapes, 3000 coloured particles, connecting lines,
 * 5 animated point lights, metallic materials, and mouse-reactive camera.
 *
 * Mounts its own <canvas> via the Three.js renderer and cleans up all
 * GPU resources on unmount.
 */
export default function ThreeBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── Scene ──────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.015);

    // Gradient background
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = 2;
    bgCanvas.height = 512;
    const bgCtx = bgCanvas.getContext('2d');
    const gradient = bgCtx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#1a0a2e');
    gradient.addColorStop(0.5, '#0f0520');
    gradient.addColorStop(1, '#050210');
    bgCtx.fillStyle = gradient;
    bgCtx.fillRect(0, 0, 2, 512);
    const gradientTexture = new THREE.CanvasTexture(bgCanvas);
    scene.background = gradientTexture;

    // ── Camera ─────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 30;

    // ── Renderer ───────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // ── Lighting ───────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0x202040, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00ffff, 3, 100);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 3, 100);
    pointLight2.position.set(-10, -10, -10);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xffff00, 3, 100);
    pointLight3.position.set(0, 10, -10);
    scene.add(pointLight3);

    const pointLight4 = new THREE.PointLight(0xff6600, 2.5, 80);
    pointLight4.position.set(15, -5, 5);
    scene.add(pointLight4);

    const pointLight5 = new THREE.PointLight(0x00ff88, 2.5, 80);
    pointLight5.position.set(-15, 5, -5);
    scene.add(pointLight5);

    // Visible light spheres
    const lightSphereGeo = new THREE.SphereGeometry(0.3, 16, 16);

    const lightSphere1 = new THREE.Mesh(
      lightSphereGeo,
      new THREE.MeshBasicMaterial({ color: 0x00ffff })
    );
    lightSphere1.add(pointLight1);
    scene.add(lightSphere1);

    const lightSphere2 = new THREE.Mesh(
      lightSphereGeo,
      new THREE.MeshBasicMaterial({ color: 0xff00ff })
    );
    lightSphere2.add(pointLight2);
    scene.add(lightSphere2);

    const lightSphere3 = new THREE.Mesh(
      lightSphereGeo,
      new THREE.MeshBasicMaterial({ color: 0xffff00 })
    );
    lightSphere3.add(pointLight3);
    scene.add(lightSphere3);

    // ── Geometric shapes ──────────────────────────────────
    const geometries = [
      new THREE.IcosahedronGeometry(1, 0),
      new THREE.OctahedronGeometry(1),
      new THREE.TetrahedronGeometry(1),
      new THREE.TorusGeometry(0.8, 0.3, 16, 100),
      new THREE.TorusKnotGeometry(0.6, 0.2, 100, 16),
      new THREE.DodecahedronGeometry(1),
      new THREE.BoxGeometry(1.5, 1.5, 1.5),
      new THREE.ConeGeometry(0.8, 1.5, 8),
    ];

    const shapes = [];
    const shapeCount = 50;

    for (let i = 0; i < shapeCount; i++) {
      const geometry = geometries[Math.floor(Math.random() * geometries.length)];
      const isWireframe = Math.random() > 0.6;
      const color = new THREE.Color().setHSL(Math.random(), 0.8, 0.6);

      const material = new THREE.MeshStandardMaterial({
        color,
        wireframe: isWireframe,
        transparent: true,
        opacity: isWireframe ? 0.6 : 0.85,
        metalness: 0.8,
        roughness: 0.2,
        emissive: color,
        emissiveIntensity: 0.2,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = (Math.random() - 0.5) * 80;
      mesh.position.y = (Math.random() - 0.5) * 80;
      mesh.position.z = (Math.random() - 0.5) * 80;
      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;

      const scale = Math.random() * 2 + 0.3;
      mesh.scale.set(scale, scale, scale);

      mesh.userData = {
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.02,
        },
        floatSpeed: Math.random() * 0.02 + 0.01,
        floatOffset: Math.random() * Math.PI * 2,
        orbitSpeed: (Math.random() - 0.5) * 0.001,
        orbitRadius: Math.random() * 10 + 5,
      };

      scene.add(mesh);
      shapes.push(mesh);
    }

    // ── Particles ─────────────────────────────────────────
    const particleCount = 3000;
    const particlesGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 120;
      particlePositions[i + 1] = (Math.random() - 0.5) * 120;
      particlePositions[i + 2] = (Math.random() - 0.5) * 120;

      const pColor = new THREE.Color().setHSL(Math.random(), 0.7, 0.7);
      particleColors[i] = pColor.r;
      particleColors[i + 1] = pColor.g;
      particleColors[i + 2] = pColor.b;
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particlesGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particlesMat = new THREE.PointsMaterial({
      size: 0.15,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });

    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    // ── Connecting lines ──────────────────────────────────
    const lineGeo = new THREE.BufferGeometry();
    const linePositions = [];
    const lineColors = [];
    const maxConnections = 500;
    const maxDistance = 8;

    for (let i = 0; i < particleCount; i++) {
      if (linePositions.length / 6 >= maxConnections) break;
      for (let j = i + 1; j < particleCount; j++) {
        const dx = particlePositions[i * 3] - particlePositions[j * 3];
        const dy = particlePositions[i * 3 + 1] - particlePositions[j * 3 + 1];
        const dz = particlePositions[i * 3 + 2] - particlePositions[j * 3 + 2];
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance < maxDistance) {
          linePositions.push(
            particlePositions[i * 3], particlePositions[i * 3 + 1], particlePositions[i * 3 + 2],
            particlePositions[j * 3], particlePositions[j * 3 + 1], particlePositions[j * 3 + 2]
          );
          const lc = new THREE.Color().setHSL(0.6, 0.8, 0.6);
          lineColors.push(lc.r, lc.g, lc.b, lc.r, lc.g, lc.b);
          if (linePositions.length / 6 >= maxConnections) break;
        }
      }
    }

    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    lineGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));

    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
    });

    const lines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lines);

    // ── Mouse tracking ────────────────────────────────────
    const mouse = { x: 0, y: 0 };
    const onMouseMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    document.addEventListener('mousemove', onMouseMove);

    // ── Animation loop ────────────────────────────────────
    let time = 0;
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      time += 0.01;

      // Shapes
      shapes.forEach((shape, index) => {
        shape.rotation.x += shape.userData.rotationSpeed.x;
        shape.rotation.y += shape.userData.rotationSpeed.y;
        shape.rotation.z += shape.userData.rotationSpeed.z;
        shape.position.y += Math.sin(time + shape.userData.floatOffset) * 0.03;

        const orbitAngle = time * shape.userData.orbitSpeed;
        shape.position.x += Math.cos(orbitAngle) * 0.01;
        shape.position.z += Math.sin(orbitAngle) * 0.01;

        const pulse = 1 + Math.sin(time * 2 + index) * 0.05;
        const baseScale = shape.scale.x / pulse;
        shape.scale.set(baseScale * pulse, baseScale * pulse, baseScale * pulse);

        if (shape.material.transparent) {
          shape.material.opacity = shape.material.wireframe
            ? 0.5 + Math.sin(time * 2 + index) * 0.2
            : 0.75 + Math.sin(time * 3 + index) * 0.15;
        }
      });

      // Particles & lines
      particles.rotation.y += 0.0003;
      particles.rotation.x += 0.0002;
      lines.rotation.y += 0.0003;
      lines.rotation.x += 0.0002;
      lines.material.opacity = 0.15 + Math.sin(time * 0.5) * 0.05;

      // Light orbits
      lightSphere1.position.x = Math.sin(time * 0.5) * 20;
      lightSphere1.position.z = Math.cos(time * 0.5) * 20;
      lightSphere1.position.y = Math.sin(time * 0.3) * 10;

      lightSphere2.position.x = Math.cos(time * 0.7) * 20;
      lightSphere2.position.z = Math.sin(time * 0.7) * 20;
      lightSphere2.position.y = Math.cos(time * 0.4) * 10;

      lightSphere3.position.y = Math.sin(time * 0.6) * 15;
      lightSphere3.position.x = Math.cos(time * 0.6) * 15;
      lightSphere3.position.z = Math.sin(time * 0.8) * 10;

      pointLight4.position.x = Math.sin(time * 0.4) * 25;
      pointLight4.position.y = Math.cos(time * 0.5) * 15;
      pointLight4.position.z = Math.sin(time * 0.3) * 20;

      pointLight5.position.x = Math.cos(time * 0.55) * 25;
      pointLight5.position.y = Math.sin(time * 0.45) * 15;
      pointLight5.position.z = Math.cos(time * 0.35) * 20;

      // Camera follows mouse
      camera.position.x += (mouse.x * 8 - camera.position.x) * 0.05;
      camera.position.y += (mouse.y * 8 - camera.position.y) * 0.05;
      camera.position.z = 30 + Math.sin(time * 0.2) * 3;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    // ── Resize handler ────────────────────────────────────
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // ── Cleanup ───────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);

      // Dispose all GPU resources
      shapes.forEach((s) => {
        s.geometry.dispose();
        s.material.dispose();
      });
      geometries.forEach((g) => g.dispose());
      lightSphereGeo.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      gradientTexture.dispose();

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0"
      style={{ pointerEvents: 'none' }}
    />
  );
}
