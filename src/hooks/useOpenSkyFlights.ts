import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Flight, FlightSnapshotResponse, RegionPreset } from '../types/opensky';
import { mergeSnapshots } from '../lib/interpolation';

type HookState = {
  loading: boolean;
  error: string | null;
  authenticated: boolean;
  rateLimitRemaining: string | null;
  rateLimitRetryAfterSeconds: string | null;
  lastUpdatedAt: number | null;
  snapshotTime: number | null;
  prevFetchedAt: number;
  nextFetchedAt: number;
  flights: Flight[];
  previousFlights: Flight[];
};

const initialState: HookState = {
  loading: true,
  error: null,
  authenticated: false,
  rateLimitRemaining: null,
  rateLimitRetryAfterSeconds: null,
  lastUpdatedAt: null,
  snapshotTime: null,
  prevFetchedAt: Date.now(),
  nextFetchedAt: Date.now(),
  flights: [],
  previousFlights: []
};

export function useOpenSkyFlights(region: RegionPreset, manualPollMs?: number) {
  const [state, setState] = useState<HookState>(initialState);
  const timeoutRef = useRef<number | null>(null);
  const mountedRef = useRef(true);
  const effectivePollMsRef = useRef(region.recommendedPollMsAnonymous);
  const fetchFlightsRef = useRef<() => Promise<void>>(async () => {});

  const effectivePollMs = useMemo(() => {
    if (manualPollMs) {
      return manualPollMs;
    }

    return state.authenticated
      ? region.recommendedPollMsAuthenticated
      : region.recommendedPollMsAnonymous;
  }, [manualPollMs, region, state.authenticated]);

  useEffect(() => {
    effectivePollMsRef.current = effectivePollMs;
  }, [effectivePollMs]);

  const scheduleNextFetch = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      void fetchFlightsRef.current();
    }, effectivePollMsRef.current);
  }, []);

  const fetchFlights = useCallback(async () => {
    const params = new URLSearchParams({
      lamin: String(region.bbox.lamin),
      lomin: String(region.bbox.lomin),
      lamax: String(region.bbox.lamax),
      lomax: String(region.bbox.lomax)
    });

    try {
      setState((current) => ({ ...current, loading: current.flights.length === 0, error: null }));
      const response = await fetch(`/api/flights?${params.toString()}`);
      const payload = (await response.json()) as FlightSnapshotResponse & {
        error?: string;
        details?: string;
      };

      if (!response.ok) {
        throw new Error(payload.details || payload.error || 'Failed to fetch flights');
      }

      if (!mountedRef.current) {
        return;
      }

      const fetchedAt = payload.fetchedAt ?? Date.now();
      setState((current) => ({
        loading: false,
        error: null,
        authenticated: payload.authenticated,
        rateLimitRemaining: payload.rateLimitRemaining,
        rateLimitRetryAfterSeconds: payload.rateLimitRetryAfterSeconds,
        lastUpdatedAt: fetchedAt,
        snapshotTime: payload.snapshotTime,
        prevFetchedAt: current.nextFetchedAt || fetchedAt,
        nextFetchedAt: fetchedAt,
        flights: payload.flights,
        previousFlights: current.flights
      }));
    } catch (error) {
      if (!mountedRef.current) {
        return;
      }

      setState((current) => ({
        ...current,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    } finally {
      if (mountedRef.current) {
        scheduleNextFetch();
      }
    }
  }, [region, scheduleNextFetch]);

  useEffect(() => {
    fetchFlightsRef.current = fetchFlights;
  }, [fetchFlights]);

  useEffect(() => {
    mountedRef.current = true;
    setState((current) => ({
      ...current,
      loading: true,
      error: null,
      flights: [],
      previousFlights: [],
      prevFetchedAt: Date.now(),
      nextFetchedAt: Date.now()
    }));

    void fetchFlights();

    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [fetchFlights]);

  const tracks = useMemo(() => mergeSnapshots(state.previousFlights, state.flights), [state.previousFlights, state.flights]);

  return {
    ...state,
    tracks,
    pollMs: effectivePollMs,
    refetchNow: () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      void fetchFlights();
    }
  };
}
