import { REGION_PRESETS } from '../lib/constants';
import { metersPerSecondToFeetPerMinute, metersPerSecondToKnots, metersToFeet } from '../lib/geo';
import type { Flight, SceneSettings } from '../types/opensky';

type HudProps = {
  regionId: string;
  onRegionChange: (value: string) => void;
  sceneSettings: SceneSettings;
  onSceneSettingsChange: (value: SceneSettings) => void;
  hoveredFlight: Flight | null;
  flightCount: number;
  loading: boolean;
  error: string | null;
  authenticated: boolean;
  rateLimitRemaining: string | null;
  rateLimitRetryAfterSeconds: string | null;
  lastUpdatedAt: number | null;
  snapshotTime: number | null;
  pollMs: number;
  onRefresh: () => void;
};

function formatTime(value: number | null) {
  if (!value) return 'n/a';
  return new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function formatUnixTime(seconds: number | null) {
  if (!seconds) return 'n/a';
  return new Date(seconds * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function formatNumber(value: number | null, digits = 0) {
  if (value == null) return 'n/a';
  return value.toLocaleString(undefined, { maximumFractionDigits: digits });
}

export function Hud({
  regionId,
  onRegionChange,
  sceneSettings,
  onSceneSettingsChange,
  hoveredFlight,
  flightCount,
  loading,
  error,
  authenticated,
  rateLimitRemaining,
  rateLimitRetryAfterSeconds,
  lastUpdatedAt,
  snapshotTime,
  pollMs,
  onRefresh
}: HudProps) {
  const altitudeFeet = metersToFeet(hoveredFlight?.geoAltitude ?? hoveredFlight?.baroAltitude ?? null);
  const speedKnots = metersPerSecondToKnots(hoveredFlight?.velocity ?? null);

  return (
    <div className="hud-root">
      <div className="hud-panel hud-panel--left">
        <div className="hud-title-row">
          <div>
            <div className="hud-kicker">React + Vite + Three.js</div>
            <h1>3D Flight Tracker</h1>
          </div>
          <button className="hud-button" onClick={onRefresh}>
            Refresh
          </button>
        </div>

        <div className="hud-grid">
          <label className="hud-field">
            <span>Region</span>
            <select value={regionId} onChange={(event) => onRegionChange(event.target.value)}>
              {REGION_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </label>

          <label className="hud-field">
            <span>Altitude exaggeration</span>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={sceneSettings.altitudeExaggeration}
              onChange={(event) =>
                onSceneSettingsChange({
                  ...sceneSettings,
                  altitudeExaggeration: Number(event.target.value)
                })
              }
            />
            <strong>{sceneSettings.altitudeExaggeration}x</strong>
          </label>

          <label className="hud-field">
            <span>Aircraft marker scale</span>
            <input
              type="range"
              min={0.02}
              max={0.09}
              step={0.005}
              value={sceneSettings.planeScale}
              onChange={(event) =>
                onSceneSettingsChange({
                  ...sceneSettings,
                  planeScale: Number(event.target.value)
                })
              }
            />
            <strong>{sceneSettings.planeScale.toFixed(3)}</strong>
          </label>

          <label className="hud-toggle">
            <input
              type="checkbox"
              checked={sceneSettings.autoRotate}
              onChange={(event) =>
                onSceneSettingsChange({
                  ...sceneSettings,
                  autoRotate: event.target.checked
                })
              }
            />
            <span>Auto-rotate globe</span>
          </label>

          <label className="hud-toggle">
            <input
              type="checkbox"
              checked={sceneSettings.showStars}
              onChange={(event) =>
                onSceneSettingsChange({
                  ...sceneSettings,
                  showStars: event.target.checked
                })
              }
            />
            <span>Star field</span>
          </label>
        </div>

        <div className="hud-stats">
          <div>
            <span>Status</span>
            <strong>{loading ? 'Loading...' : error ? 'Error' : 'Live'}</strong>
          </div>
          <div>
            <span>Flights</span>
            <strong>{formatNumber(flightCount)}</strong>
          </div>
          <div>
            <span>Mode</span>
            <strong>{authenticated ? 'OAuth' : 'Anonymous'}</strong>
          </div>
          <div>
            <span>Poll</span>
            <strong>{Math.round(pollMs / 1000)}s</strong>
          </div>
          <div>
            <span>Snapshot</span>
            <strong>{formatUnixTime(snapshotTime)}</strong>
          </div>
          <div>
            <span>Updated</span>
            <strong>{formatTime(lastUpdatedAt)}</strong>
          </div>
          <div>
            <span>Credits left</span>
            <strong>{rateLimitRemaining ?? 'n/a'}</strong>
          </div>
          <div>
            <span>Retry after</span>
            <strong>{rateLimitRetryAfterSeconds ? `${rateLimitRetryAfterSeconds}s` : 'n/a'}</strong>
          </div>
        </div>

        {error && <div className="hud-error">{error}</div>}
      </div>

      <div className="hud-panel hud-panel--right">
        <div className="hud-kicker">Hovered aircraft</div>
        {hoveredFlight ? (
          <div className="flight-card">
            <h2>{hoveredFlight.callsign || hoveredFlight.icao24.toUpperCase()}</h2>
            <dl>
              <div>
                <dt>ICAO24</dt>
                <dd>{hoveredFlight.icao24.toUpperCase()}</dd>
              </div>
              <div>
                <dt>Country</dt>
                <dd>{hoveredFlight.originCountry || 'Unknown'}</dd>
              </div>
              <div>
                <dt>Altitude</dt>
                <dd>{altitudeFeet != null ? `${formatNumber(altitudeFeet)} ft` : 'n/a'}</dd>
              </div>
              <div>
                <dt>Speed</dt>
                <dd>{speedKnots != null ? `${formatNumber(speedKnots)} kt` : 'n/a'}</dd>
              </div>
              <div>
                <dt>Track</dt>
                <dd>{hoveredFlight.trueTrack != null ? `${formatNumber(hoveredFlight.trueTrack, 0)}°` : 'n/a'}</dd>
              </div>
              <div>
                <dt>Vertical rate</dt>
                <dd>
                  {hoveredFlight.verticalRate != null
                    ? `${formatNumber(metersPerSecondToFeetPerMinute(hoveredFlight.verticalRate) ?? null)} ft/min`
                    : 'n/a'}
                </dd>
              </div>
              <div>
                <dt>Source</dt>
                <dd>{hoveredFlight.positionSource ?? 'n/a'}</dd>
              </div>
              <div>
                <dt>Last contact</dt>
                <dd>{formatUnixTime(hoveredFlight.lastContact)}</dd>
              </div>
            </dl>
          </div>
        ) : (
          <div className="flight-empty">Hover any marker to inspect its live state vector.</div>
        )}
      </div>
    </div>
  );
}
