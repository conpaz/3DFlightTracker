import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { EARTH_RADIUS_UNITS } from '../lib/constants';

const DAY_MAP = 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg';
const NORMAL_MAP = 'https://threejs.org/examples/textures/planets/earth_normal_2048.jpg';
const SPECULAR_MAP = 'https://threejs.org/examples/textures/planets/earth_specular_2048.jpg';
const NIGHT_MAP = 'https://threejs.org/examples/textures/planets/earth_lights_2048.png';
const CLOUD_MAP = 'https://threejs.org/examples/textures/planets/earth_clouds_1024.png';

export function Globe() {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  const [dayMap, normalMap, specularMap, nightMap, cloudMap] = useTexture([
    DAY_MAP,
    NORMAL_MAP,
    SPECULAR_MAP,
    NIGHT_MAP,
    CLOUD_MAP
  ]);

  useFrame((_, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.015;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.02;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y -= delta * 0.005;
    }
  });

  return (
    <group>
      <mesh ref={earthRef}>
        <sphereGeometry args={[EARTH_RADIUS_UNITS, 128, 128]} />
        <meshStandardMaterial
          map={dayMap}
          normalMap={normalMap}
          metalness={0.05}
          roughness={0.9}
          emissiveMap={nightMap}
          emissive={new THREE.Color('#8ab4ff')}
          emissiveIntensity={0.35}
          aoMapIntensity={1}
          metalnessMap={specularMap}
        />
      </mesh>

      <mesh ref={cloudsRef}>
        <sphereGeometry args={[EARTH_RADIUS_UNITS * 1.008, 96, 96]} />
        <meshStandardMaterial
          map={cloudMap}
          transparent
          opacity={0.18}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[EARTH_RADIUS_UNITS * 1.03, 96, 96]} />
        <meshBasicMaterial
          color="#4da3ff"
          transparent
          opacity={0.11}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[EARTH_RADIUS_UNITS * 1.055, 96, 96]} />
        <meshBasicMaterial
          color="#2563eb"
          transparent
          opacity={0.07}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
