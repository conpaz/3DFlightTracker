import type { RegionPreset, SceneSettings } from '../types/opensky';

export const EARTH_RADIUS_UNITS = 5;
export const EARTH_RADIUS_KM = 6371;
export const MAX_EXTRAPOLATION_SECONDS = 30;

export const DEFAULT_SCENE_SETTINGS: SceneSettings = {
  altitudeExaggeration: 1,
  planeScale: 0.035,
  autoRotate: false,
  showStars: true
};

export const REGION_PRESETS: RegionPreset[] = [
  {
    id: 'northeast-us',
    label: 'Northeast US',
    bbox: { lamin: 36, lomin: -82, lamax: 47.5, lomax: -66 },
    recommendedPollMsAnonymous: 1_200_000,
    recommendedPollMsAuthenticated: 90_000
  },
  {
    id: 'continental-us',
    label: 'Continental US',
    bbox: { lamin: 24.5, lomin: -125, lamax: 49.5, lomax: -66 },
    recommendedPollMsAnonymous: 900_000,
    recommendedPollMsAuthenticated: 90_000
  },
  {
    id: 'europe',
    label: 'Europe',
    bbox: { lamin: 35, lomin: -11, lamax: 61, lomax: 30 },
    recommendedPollMsAnonymous: 900_000,
    recommendedPollMsAuthenticated: 90_000
  },
  {
    id: 'south-america',
    label: 'South America',
    bbox: { lamin: -56, lomin: -82, lamax: 13, lomax: -34 },
    recommendedPollMsAnonymous: 900_000,
    recommendedPollMsAuthenticated: 90_000
  },
  {
    id: 'world',
    label: 'World (slow mode)',
    bbox: { lamin: -90, lomin: -180, lamax: 90, lomax: 180 },
    recommendedPollMsAnonymous: 900_000,
    recommendedPollMsAuthenticated: 90_000
  }
];

export const DEFAULT_REGION_ID = 'northeast-us';
