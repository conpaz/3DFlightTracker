import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Flight, FlightTrack } from '../types/opensky';
import { computeOrientationMatrix } from '../lib/geo';
import { getInterpolatedFlightState } from '../lib/interpolation';

type AircraftInstancesProps = {
  tracks: FlightTrack[];
  prevFetchedAt: number;
  nextFetchedAt: number;
  altitudeExaggeration: number;
  planeScale: number;
  onHoverFlight: (flight: Flight | null) => void;
};

const hoverColor = new THREE.Color('#f8fafc');
const skyColor = new THREE.Color('#38bdf8');
const groundColor = new THREE.Color('#f59e0b');

export function AircraftInstances({
  tracks,
  prevFetchedAt,
  nextFetchedAt,
  altitudeExaggeration,
  planeScale,
  onHoverFlight
}: AircraftInstancesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const activeTracksRef = useRef<FlightTrack[]>(tracks);
  const hoveredIdRef = useRef<string | null>(null);

  useEffect(() => {
    activeTracksRef.current = tracks;
  }, [tracks]);

  const geometry = useMemo(() => {
    const cone = new THREE.ConeGeometry(0.25, 1, 8, 1);
    cone.rotateX(Math.PI / 2);
    cone.translate(0, 0, 0.4);
    return cone;
  }, []);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#38bdf8',
        emissive: '#0ea5e9',
        emissiveIntensity: 0.65,
        metalness: 0.45,
        roughness: 0.22
      }),
    []
  );

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const now = Date.now();
    const tracks = activeTracksRef.current;

    for (let i = 0; i < tracks.length; i += 1) {
      const interpolated = getInterpolatedFlightState(
        tracks[i],
        now,
        prevFetchedAt,
        nextFetchedAt,
        altitudeExaggeration
      );

      const matrix = computeOrientationMatrix(
        interpolated.position,
        interpolated.headingDeg,
        planeScale * (interpolated.flight.onGround ? 0.8 : 1)
      );

      mesh.setMatrixAt(i, matrix);
      mesh.setColorAt(
        i,
        hoveredIdRef.current === interpolated.flight.icao24
          ? hoverColor
          : interpolated.flight.onGround
            ? groundColor
            : skyColor
      );
    }

    mesh.count = tracks.length;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, 10000]}
      onPointerMove={(event) => {
        event.stopPropagation();
        const instanceId = event.instanceId;
        if (instanceId == null) return;
        const flight = activeTracksRef.current[instanceId]?.next ?? null;
        hoveredIdRef.current = flight?.icao24 ?? null;
        onHoverFlight(flight);
      }}
      onPointerOut={() => {
        hoveredIdRef.current = null;
        onHoverFlight(null);
      }}
    />
  );
}
