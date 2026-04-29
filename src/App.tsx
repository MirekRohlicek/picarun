import { useEffect, useMemo } from 'react';
import { Panel } from './components/Panel';
import { MapView } from './components/MapView';
import { useAppStore } from './store/useAppStore';

export default function App() {
  const { lat, lon, route, view, setView, setLocation, setGpsStatus } = useAppStore();

  // GPS při startu
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus('error', 'GPS není dostupné');
      return;
    }
    setGpsStatus('loading', 'Zjišťuji polohu…');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation(coords.latitude, coords.longitude);
        setGpsStatus(
          'ok',
          `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`,
        );
      },
      () => setGpsStatus('error', 'Polohu nelze zjistit – použita Praha'),
      { timeout: 15000, maximumAge: 300000, enableHighAccuracy: false },
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Memoize center to avoid flyTo firing on every render
  const center = useMemo<[number, number]>(() => [lon, lat], [lon, lat]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Panel – always mounted, hidden on mobile when map is shown */}
      <div className={`w-full md:w-72 shrink-0 ${view === 'map' ? 'hidden md:flex' : 'flex'} flex-col`}>
        <Panel />
      </div>

      {/* Map – always mounted (single MapLibre instance), hidden on mobile when panel is shown */}
      <div className={`flex-1 relative ${view === 'panel' ? 'hidden md:flex' : 'flex'}`}>
        <MapView center={center} route={route} />
        {route && <KmPill distanceM={route.distanceM} />}
        {view === 'map' && (
          <button
            onClick={() => setView('panel')}
            aria-label="Zpět na panel"
            className="absolute top-3 left-3 bg-bg/90 backdrop-blur border border-panel rounded-lg px-3 py-1.5 text-xs text-cream"
          >
            ← Zpět
          </button>
        )}
      </div>
    </div>
  );
}

function KmPill({ distanceM }: { distanceM: number }) {
  const km = (distanceM / 1000).toFixed(2);
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-bg/90 backdrop-blur border border-panel rounded-full px-5 py-2 flex items-baseline gap-1.5 pointer-events-none">
      <span className="text-2xl font-black text-accent">{km}</span>
      <span className="text-secondary text-sm">km</span>
    </div>
  );
}
