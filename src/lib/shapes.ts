import { geodesicOffset, midpoint } from './geo';

export const SHAPE_IDS = ['diamond', 'circle', 'square', 'triangle', 'pentagon'] as const;
export type ShapeId = (typeof SHAPE_IDS)[number];

export const SHAPE_LABELS: Record<ShapeId, string> = {
  diamond:  'Koso',
  circle:   'Kruh',
  square:   'Čtv.',
  triangle: 'Troj.',
  pentagon: '5-úhel',
};

/** Koeficient: reálná pěší trasa ÷ vzdušná vzdálenost (urban) */
const DETOUR = 1.18;

/** Vrátí waypoints pro daný tvar v GeoJSON pořadí [lon, lat]. */
export function generateWaypoints(
  shape: ShapeId,
  lat: number,
  lon: number,
  km: number,
  rotationDeg: number,
): [number, number][] {
  switch (shape) {
    case 'diamond':  return diamond(lat, lon, km, rotationDeg);
    case 'circle':   return circle(lat, lon, km, rotationDeg);
    case 'square':   return square(lat, lon, km, rotationDeg);
    case 'triangle': return triangle(lat, lon, km, rotationDeg);
    case 'pentagon': return pentagon(lat, lon, km, rotationDeg);
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function polyWithMids(corners: [number, number][]): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i < corners.length; i++) {
    pts.push(corners[i]);
    pts.push(midpoint(corners[i], corners[(i + 1) % corners.length]));
  }
  pts.push(corners[0]); // uzavření
  return pts;
}

function cornersFromAngles(
  lat: number,
  lon: number,
  radiusM: number,
  angles: number[],
): [number, number][] {
  return angles.map((a) => geodesicOffset(lat, lon, radiusM, a)) as [number, number][];
}

// ── Tvary ────────────────────────────────────────────────────────────────────

function diamond(lat: number, lon: number, km: number, rot: number): [number, number][] {
  // Čtverec otočený o 45° + uživatelská rotace
  const hd = ((km * 1000) / 4) * (Math.sqrt(2) / 2) / DETOUR;
  const corners = cornersFromAngles(lat, lon, hd, [90, 180, 270, 360].map((a) => a + rot));
  return polyWithMids(corners); // 9 bodů
}

function circle(lat: number, lon: number, km: number, rot: number): [number, number][] {
  // 24 bodů rovnoměrně + uzavření
  const R = (km * 1000) / (2 * Math.PI * DETOUR);
  const pts = Array.from({ length: 24 }, (_, i) =>
    geodesicOffset(lat, lon, R, rot + (360 / 24) * i),
  ) as [number, number][];
  pts.push(pts[0]); // uzavření
  return pts; // 25 bodů
}

function square(lat: number, lon: number, km: number, rot: number): [number, number][] {
  const hd = ((km * 1000) / 4) * (Math.sqrt(2) / 2) / DETOUR;
  const corners = cornersFromAngles(lat, lon, hd, [45, 135, 225, 315].map((a) => a + rot));
  return polyWithMids(corners); // 9 bodů
}

function triangle(lat: number, lon: number, km: number, rot: number): [number, number][] {
  const R = (km * 1000 / 3) / (Math.sqrt(3) * DETOUR);
  const corners = cornersFromAngles(lat, lon, R, [0, 120, 240].map((a) => a + rot));
  return polyWithMids(corners); // 7 bodů
}

function pentagon(lat: number, lon: number, km: number, rot: number): [number, number][] {
  const R = (km * 1000) / (5 * 2 * Math.sin(Math.PI / 5) * DETOUR);
  const corners = cornersFromAngles(lat, lon, R, [0, 72, 144, 216, 288].map((a) => a + rot - 90));
  return polyWithMids(corners); // 11 bodů
}
