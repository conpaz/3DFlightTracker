const OPENSKY_BASE_URL = 'https://opensky-network.org/api';
const OPENSKY_TOKEN_URL =
  'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token';

let tokenCache = {
  accessToken: null,
  expiresAt: 0
};

export function hasClientCredentials() {
  return Boolean(process.env.OPENSKY_CLIENT_ID && process.env.OPENSKY_CLIENT_SECRET);
}

export async function getAccessToken() {
  if (!hasClientCredentials()) {
    return null;
  }

  const now = Date.now();
  if (tokenCache.accessToken && now < tokenCache.expiresAt - 30_000) {
    return tokenCache.accessToken;
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.OPENSKY_CLIENT_ID,
    client_secret: process.env.OPENSKY_CLIENT_SECRET
  });

  const response = await fetch(OPENSKY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to obtain OpenSky token (${response.status}): ${text}`);
  }

  const payload = await response.json();
  tokenCache = {
    accessToken: payload.access_token,
    expiresAt: Date.now() + Number(payload.expires_in || 1800) * 1000
  };

  return tokenCache.accessToken;
}

export function parseNumber(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function buildStatesUrl(query) {
  const url = new URL(`${OPENSKY_BASE_URL}/states/all`);

  const params = {
    lamin: parseNumber(query.lamin),
    lomin: parseNumber(query.lomin),
    lamax: parseNumber(query.lamax),
    lomax: parseNumber(query.lomax),
    extended: 1
  };

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  return url;
}

export function normalizeFlight(state) {
  const [
    icao24,
    callsign,
    origin_country,
    time_position,
    last_contact,
    longitude,
    latitude,
    baro_altitude,
    on_ground,
    velocity,
    true_track,
    vertical_rate,
    sensors,
    geo_altitude,
    squawk,
    spi,
    position_source,
    category
  ] = state;

  if (latitude == null || longitude == null) {
    return null;
  }

  return {
    icao24,
    callsign: callsign?.trim() || null,
    originCountry: origin_country ?? null,
    timePosition: time_position ?? null,
    lastContact: last_contact ?? null,
    longitude,
    latitude,
    baroAltitude: baro_altitude ?? null,
    geoAltitude: geo_altitude ?? null,
    onGround: Boolean(on_ground),
    velocity: velocity ?? null,
    trueTrack: true_track ?? null,
    verticalRate: vertical_rate ?? null,
    sensors: sensors ?? null,
    squawk: squawk ?? null,
    spi: spi ?? null,
    positionSource: position_source ?? null,
    category: category ?? null
  };
}

export async function fetchFlights(query) {
  const url = buildStatesUrl(query);
  const token = await getAccessToken();

  const response = await fetch(url, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`
        }
      : undefined
  });

  if (!response.ok) {
    const errorText = await response.text();
    const error = new Error(`OpenSky request failed with status ${response.status}`);
    error.statusCode = response.status;
    error.details = errorText;
    throw error;
  }

  const payload = await response.json();
  const rawStates = Array.isArray(payload.states) ? payload.states : [];
  const flights = rawStates.map(normalizeFlight).filter(Boolean);

  return {
    fetchedAt: Date.now(),
    snapshotTime: payload.time ?? null,
    authenticated: Boolean(token),
    rateLimitRemaining: response.headers.get('x-rate-limit-remaining'),
    rateLimitRetryAfterSeconds: response.headers.get('x-rate-limit-retry-after-seconds'),
    flights
  };
}
