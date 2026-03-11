import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Preload, Stars } from '@react-three/drei';
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import { Globe } from './Globe';
import { AircraftInstances } from './AircraftInstances';
import type { Flight, FlightTrack, SceneSettings } from '../types/opensky';

type EarthSceneProps = {
  tracks: FlightTrack[];
  prevFetchedAt: number;
  nextFetchedAt: number;
  sceneSettings: SceneSettings;
  onHoverFlight: (flight: Flight | null) => void;
};

export function EarthScene({
  tracks,
  prevFetchedAt,
  nextFetchedAt,
  sceneSettings,
  onHoverFlight
}: EarthSceneProps) {
  return (
    <Canvas camera={{ position: [0, 0, 15], fov: 42 }} gl={{ antialias: true }}>
      <color attach="background" args={['#020617']} />
      <fog attach="fog" args={['#020617', 16, 40]} />

      <ambientLight intensity={0.22} />
      <hemisphereLight args={['#9ec8ff', '#152238', 0.55]} />
      <directionalLight position={[10, 6, 12]} intensity={2.2} color="#ffffff" />
      <directionalLight position={[-12, -4, -8]} intensity={0.25} color="#4b7cff" />

      <Suspense fallback={null}>
        {sceneSettings.showStars && <Stars radius={120} depth={60} count={6000} factor={4} fade speed={0.4} />}
        <Globe />
        <AircraftInstances
          tracks={tracks}
          prevFetchedAt={prevFetchedAt}
          nextFetchedAt={nextFetchedAt}
          altitudeExaggeration={sceneSettings.altitudeExaggeration}
          planeScale={sceneSettings.planeScale}
          onHoverFlight={onHoverFlight}
        />
      </Suspense>

      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.55}
        minDistance={8}
        maxDistance={24}
        autoRotate={sceneSettings.autoRotate}
        autoRotateSpeed={0.45}
      />

      <EffectComposer>
        <Bloom intensity={0.7} luminanceThreshold={0.2} mipmapBlur />
        <Noise opacity={0.015} />
        <Vignette eskil={false} offset={0.15} darkness={0.85} />
      </EffectComposer>

      <Preload all />
    </Canvas>
  );
}
