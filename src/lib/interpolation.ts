import * as THREE from 'three';
import type { Flight, FlightTrack } from '../types/opensky';
import { EARTH_RADIUS_KM, EARTH_RADIUS_UNITS, MAX_EXTRAPOLATION_SECONDS } from './constants';
import { latLonAltToVector3, predictLatLon } from './geo';

const scratchA = new THREE.Vector3();
const scratchB = new THREE.Vector3();

export function mergeSnapshots(previous: Flight[], next: Flight[]) {
  const prevById = new Map(previous.map((flight) => [flight.icao24, flight]));

  return next.map<FlightTrack>((flight) => ({
    id: flight.icao24,
    prev: prevById.get(flight.icao24),
    next: flight
  }));
}

function preferredAltitude(flight: Flight) {
  return flight.geoAltitude ?? flight.baroAltitude ?? 0;
}

function slerpPosition(
  start: Flight,
  end: Flight,
  t: number,
  altitudeExaggeration: number
) {
  const startAltitude = preferredAltitude(start);
  const endAltitude = preferredAltitude(end);

  scratchA.copy(latLonAltToVector3(start.latitude, start.longitude, 0, 1)).normalize();
  scratchB.copy(latLonAltToVector3(end.latitude, end.longitude, 0, 1)).normalize();

  const direction = scratchA.clone().slerp(scratchB, THREE.MathUtils.clamp(t, 0, 1));
  const altitudeMeters = THREE.MathUtils.lerp(startAltitude, endAltitude, THREE.MathUtils.clamp(t, 0, 1));
  const altitudeOffset = (altitudeMeters / 1000 / EARTH_RADIUS_KM) * EARTH_RADIUS_UNITS * altitudeExaggeration;

  return direction.multiplyScalar(EARTH_RADIUS_UNITS + altitudeOffset);
}

export function getInterpolatedFlightState(
  track: FlightTrack,
  nowMs: number,
  prevFetchedAtMs: number,
  nextFetchedAtMs: number,
  altitudeExaggeration: number
) {
  const current = track.next;
  const previous = track.prev;
  const intervalMs = Math.max(nextFetchedAtMs - prevFetchedAtMs, 1);
  const rawT = (nowMs - prevFetchedAtMs) / intervalMs;
  const clampedT = THREE.MathUtils.clamp(rawT, 0, 1);

  let latitude = current.latitude;
  let longitude = current.longitude;
  let altitudeMeters = preferredAltitude(current);

  if (previous) {
    const interpolatedSurfacePosition = slerpPosition(previous, current, clampedT, altitudeExaggeration);
    altitudeMeters = THREE.MathUtils.lerp(preferredAltitude(previous), preferredAltitude(current), clampedT);

    if (rawT <= 1) {
      return {
        flight: current,
        position: interpolatedSurfacePosition,
        altitudeMeters,
        headingDeg: current.trueTrack ?? previous.trueTrack ?? 0
      };
    }
  }

  const extraSeconds = Math.min((nowMs - nextFetchedAtMs) / 1000, MAX_EXTRAPOLATION_SECONDS);
  if (extraSeconds > 0.01 && current.velocity != null && current.trueTrack != null) {
    const predicted = predictLatLon(
      current.latitude,
      current.longitude,
      current.trueTrack,
      current.velocity * extraSeconds
    );

    latitude = predicted.latitude;
    longitude = predicted.longitude;
    altitudeMeters += (current.verticalRate ?? 0) * extraSeconds;
  }

  return {
    flight: current,
    position: latLonAltToVector3(latitude, longitude, altitudeMeters, altitudeExaggeration),
    altitudeMeters,
    headingDeg: current.trueTrack ?? previous?.trueTrack ?? 0
  };
}
