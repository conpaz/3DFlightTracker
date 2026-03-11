import { useMemo, useState } from 'react';
import { EarthScene } from './components/EarthScene';
import { Hud } from './components/Hud';
import { useOpenSkyFlights } from './hooks/useOpenSkyFlights';
import { DEFAULT_REGION_ID, DEFAULT_SCENE_SETTINGS, REGION_PRESETS } from './lib/constants';
import type { Flight, SceneSettings } from './types/opensky';

export default function App() {
  const [regionId, setRegionId] = useState(DEFAULT_REGION_ID);
  const [sceneSettings, setSceneSettings] = useState<SceneSettings>(DEFAULT_SCENE_SETTINGS);
  const [hoveredFlight, setHoveredFlight] = useState<Flight | null>(null);

  const region = useMemo(
    () => REGION_PRESETS.find((item) => item.id === regionId) ?? REGION_PRESETS[0],
    [regionId]
  );

  const flightData = useOpenSkyFlights(region);

  return (
    <div className="app-shell">
      <EarthScene
        tracks={flightData.tracks}
        prevFetchedAt={flightData.prevFetchedAt}
        nextFetchedAt={flightData.nextFetchedAt}
        sceneSettings={sceneSettings}
        onHoverFlight={setHoveredFlight}
      />

      <Hud
        regionId={regionId}
        onRegionChange={setRegionId}
        sceneSettings={sceneSettings}
        onSceneSettingsChange={setSceneSettings}
        hoveredFlight={hoveredFlight}
        flightCount={flightData.flights.length}
        loading={flightData.loading}
        error={flightData.error}
        authenticated={flightData.authenticated}
        rateLimitRemaining={flightData.rateLimitRemaining}
        rateLimitRetryAfterSeconds={flightData.rateLimitRetryAfterSeconds}
        lastUpdatedAt={flightData.lastUpdatedAt}
        snapshotTime={flightData.snapshotTime}
        pollMs={flightData.pollMs}
        onRefresh={flightData.refetchNow}
      />
    </div>
  );
}
