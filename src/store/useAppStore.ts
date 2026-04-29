import { create } from 'zustand';
import type { ShapeId } from '../lib/shapes';
import type { GenerateResult } from '../lib/generate';

type GpsStatus = 'idle' | 'loading' | 'ok' | 'error';
type View = 'panel' | 'map';

interface AppState {
  // Konfigurace trasy
  shape: ShapeId;
  km: number;
  rotationDeg: number;
  lat: number;
  lon: number;

  // GPS
  gpsStatus: GpsStatus;
  gpsMessage: string;

  // Generování
  generating: boolean;
  route: GenerateResult | null;
  error: string | null;

  // Pohled (mobil: panel nebo mapa)
  view: View;

  // Akce
  setShape: (shape: ShapeId) => void;
  setKm: (km: number) => void;
  rotate: () => void;
  setLocation: (lat: number, lon: number) => void;
  setGpsStatus: (status: GpsStatus, message: string) => void;
  startGenerating: () => void;
  setRoute: (route: GenerateResult) => void;
  setError: (error: string) => void;
  setView: (view: View) => void;
}

export const useAppStore = create<AppState>((set) => ({
  shape: 'diamond',
  km: 5,
  rotationDeg: 0,
  lat: 50.0755,
  lon: 14.4378,
  gpsStatus: 'idle',
  gpsMessage: '',
  generating: false,
  route: null,
  error: null,
  view: 'panel',

  setShape: (shape) => set({ shape }),
  setKm: (km) => set({ km }),
  rotate: () => set((s) => ({ rotationDeg: (s.rotationDeg + 45) % 360 })),
  setLocation: (lat, lon) => set({ lat, lon }),
  setGpsStatus: (gpsStatus, gpsMessage) => set({ gpsStatus, gpsMessage }),
  startGenerating: () => set({ generating: true, error: null }),
  setRoute: (route) => set({ route, generating: false, view: 'map' }),
  setError: (error) => set({ error, generating: false }),
  setView: (view) => set({ view }),
}));
