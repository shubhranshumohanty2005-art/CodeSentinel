import { BlackHoleHeroSection } from '../ui/BlackHoleHeroSection';

/**
 * BlackHoleBackground
 *
 * Full-screen, fixed-position black hole background rendered behind page content.
 * Replaces the previous ThreeBackground component. Uses a WebGL ray-marched
 * black hole with gravitational lensing instead of Three.js geometry.
 *
 * The hole is centred in the frame with lower brightness and resolution
 * to keep it subtle behind page UI and performant across devices.
 */
export default function BlackHoleBackground() {
  return (
    <div
      className="fixed inset-0 z-0"
      style={{ pointerEvents: 'none' }}
    >
      <BlackHoleHeroSection
        focus={[0.5, 0.5]}
        scrim="none"
        distance={28}
        elevation={-8}
        roll={-15}
        fov={38}
        brightness={0.7}
        glow={0.8}
        exposure={0.75}
        vignette={0.45}
        spinSpeed={0.04}
        doppler={0.25}
        steps={220}
        resolution={0.55}
        maxDpr={1.5}
        hotColor="#B8D4FF"
        midColor="#6B8CFF"
        coolColor="#1A2466"
        starBrightness={0.3}
      />
    </div>
  );
}
