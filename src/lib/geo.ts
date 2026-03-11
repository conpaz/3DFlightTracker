import * as THREE from 'three';
import { EARTH_RADIUS_KM, EARTH_RADIUS_UNITS } from './constants';

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

export function altitudeMetersToWorldUnits(altitudeMeters: number, exaggeration = 1) {
  const altitudeKm = altitudeMeters / 1000;
  return (altitudeKm / EARTH_RADIUS_KM) * EARTH_RADIUS_UNITS * exaggeration;
}

export function latLonAltToVector3(
  latitudeDeg: number,
  longitudeDeg: number,
  altitudeMeters = 0,
  altitudeExaggeration = 1
) {
  const phi = (90 - latitudeDeg) * DEG2RAD;
  const theta = (longitudeDeg + 180) * DEG2RAD;
  const radius = EARTH_RADIUS_UNITS + altitudeMetersToWorldUnits(altitudeMeters, altitudeExaggeration);

  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

export function metersPerSecondToKnots(value: number | null) {
  return value == null ? null : value * 1.943844;
}

export function metersToFeet(value: number | null) {
  return value == null ? null : value * 3.28084;
}

export function metersPerSecondToFeetPerMinute(value: number | null) {
  return value == null ? null : value * 196.850394;
}

export function normalizeLongitude(longitudeDeg: number) {
  let result = longitudeDeg;
  while (result < -180) result += 360;
  while (result > 180) result -= 360;
  return result;
}

export function predictLatLon(
  latitudeDeg: number,
  longitudeDeg: number,
  trackDeg: number,
  distanceMeters: number
) {
  const angularDistance = distanceMeters / (EARTH_RADIUS_KM * 1000);
  const bearing = trackDeg * DEG2RAD;
  const lat1 = latitudeDeg * DEG2RAD;
  const lon1 = longitudeDeg * DEG2RAD;

  const sinLat1 = Math.sin(lat1);
  const cosLat1 = Math.cos(lat1);
  const sinAd = Math.sin(angularDistance);
  const cosAd = Math.cos(angularDistance);

  const lat2 = Math.asin(sinLat1 * cosAd + cosLat1 * sinAd * Math.cos(bearing));
  const lon2 = lon1 + Math.atan2(
    Math.sin(bearing) * sinAd * cosLat1,
    cosAd - sinLat1 * Math.sin(lat2)
  );

  return {
    latitude: lat2 * RAD2DEG,
    longitude: normalizeLongitude(lon2 * RAD2DEG)
  };
}

export function computeOrientationMatrix(
  position: THREE.Vector3,
  forwardTrackDeg: number,
  scale: number
) {
  const up = position.clone().normalize();
  const reference = Math.abs(up.y) > 0.98 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
  const east = reference.clone().cross(up).normalize();
  const north = up.clone().cross(east).normalize();
  const headingRad = forwardTrackDeg * DEG2RAD;

  const tangentForward = north.multiplyScalar(Math.cos(headingRad)).add(east.multiplyScalar(Math.sin(headingRad))).normalize();
  const tangentRight = tangentForward.clone().cross(up).normalize();

  const basis = new THREE.Matrix4().makeBasis(tangentRight, up, tangentForward);
  const translation = new THREE.Matrix4().makeTranslation(position.x, position.y, position.z);
  const scaling = new THREE.Matrix4().makeScale(scale, scale, scale * 1.8);

  return translation.multiply(basis).multiply(scaling);
}
