import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const MAPY_KEY = import.meta.env.VITE_MAPY_CZ_API_KEY as string;

interface Props {
  center: [number, number]; // [lon, lat]
  route: { coordinates: [number, number][] } | null;
}

export function MapView({ center, route }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  // Inicializace mapy – jen jednou při mountu
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          mapy: {
            type: 'raster',
            tiles: [
              `https://api.mapy.cz/v1/maptiles/outdoor/256/{z}/{x}/{y}?apikey=${MAPY_KEY}`,
            ],
            tileSize: 256,
            attribution: '© <a href="https://mapy.cz">Mapy.cz</a> © OpenStreetMap',
          },
        },
        layers: [{ id: 'mapy', type: 'raster', source: 'mapy' }],
      },
      center,
      zoom: 13,
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Přelet na nový střed
  useEffect(() => {
    mapRef.current?.flyTo({ center, zoom: 13, duration: 600 });
  }, [center]);

  // Vykreslení trasy
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const render = () => {
      clearRoute(map);
      if (!route) return;
      drawRoute(map, route.coordinates);
    };

    if (map.isStyleLoaded()) render();
    else map.once('load', render);
  }, [route]);

  return <div ref={containerRef} className="w-full h-full" />;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function clearRoute(map: maplibregl.Map) {
  ['route-line', 'route-casing', 'start-dot'].forEach((id) => {
    if (map.getLayer(id)) map.removeLayer(id);
  });
  ['route-source', 'start-source'].forEach((id) => {
    if (map.getSource(id)) map.removeSource(id);
  });
}

function drawRoute(map: maplibregl.Map, coordinates: [number, number][]) {
  map.addSource('route-source', {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates },
    },
  });

  map.addLayer({
    id: 'route-casing',
    type: 'line',
    source: 'route-source',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': '#0F1226', 'line-width': 10, 'line-opacity': 0.7 },
  });

  map.addLayer({
    id: 'route-line',
    type: 'line',
    source: 'route-source',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': '#FF6A4A', 'line-width': 5 },
  });

  // Start/cíl marker
  map.addSource('start-source', {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {},
      geometry: { type: 'Point', coordinates: coordinates[0] },
    },
  });

  map.addLayer({
    id: 'start-dot',
    type: 'circle',
    source: 'start-source',
    paint: {
      'circle-radius': 8,
      'circle-color': '#FF6A4A',
      'circle-stroke-color': '#FCF8F4',
      'circle-stroke-width': 2,
    },
  });

  // Přiblíž na trasu
  const lons = coordinates.map((c) => c[0]);
  const lats = coordinates.map((c) => c[1]);
  map.fitBounds(
    [
      [Math.min(...lons), Math.min(...lats)],
      [Math.max(...lons), Math.max(...lats)],
    ],
    { padding: 60, duration: 700 },
  );
}
