export type BoundingBox = {
  lamin: number;
  lomin: number;
  lamax: number;
  lomax: number;
};

export type RegionPreset = {
  id: string;
  label: string;
  bbox: BoundingBox;
  recommendedPollMsAnonymous: number;
  recommendedPollMsAuthenticated: number;
};

export type Flight = {
  icao24: string;
  callsign: string | null;
  originCountry: string | null;
  timePosition: number | null;
  lastContact: number | null;
  longitude: number;
  latitude: number;
  baroAltitude: number | null;
  geoAltitude: number | null;
  onGround: boolean;
  velocity: number | null;
  trueTrack: number | null;
  verticalRate: number | null;
  sensors: number[] | null;
  squawk: string | null;
  spi: boolean | null;
  positionSource: number | null;
  category: number | null;
};

export type FlightSnapshotResponse = {
  fetchedAt: number;
  snapshotTime: number | null;
  authenticated: boolean;
  rateLimitRemaining: string | null;
  rateLimitRetryAfterSeconds: string | null;
  flights: Flight[];
};

export type FlightTrack = {
  id: string;
  prev?: Flight;
  next: Flight;
};

export type SceneSettings = {
  altitudeExaggeration: number;
  planeScale: number;
  autoRotate: boolean;
  showStars: boolean;
};
