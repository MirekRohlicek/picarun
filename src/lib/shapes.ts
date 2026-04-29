import { geodesicOffset, midpoint } from './geo';

export const SHAPE_IDS = ['pica', 'penis', 'heart', 'square', 'triangle'] as const;
export type ShapeId = (typeof SHAPE_IDS)[number];

export const SHAPE_LABELS: Record<ShapeId, string> = {
  pica:     'Pica',
  penis:    'Penis',
  heart:    'Srdce',
  square:   'Čtv.',
  triangle: 'Troj.',
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
    case 'pica':     return pica(lat, lon, km, rotationDeg);
    case 'penis':    return penis(lat, lon, km, rotationDeg);
    case 'heart':    return heart(lat, lon, km, rotationDeg);
    case 'square':   return square(lat, lon, km, rotationDeg);
    case 'triangle': return triangle(lat, lon, km, rotationDeg);
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function polyWithMids(corners: [number, number][]): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i < corners.length; i++) {
    pts.push(corners[i]);
    pts.push(midpoint(corners[i], corners[(i + 1) % corners.length]));
  }
  pts.push(corners[0]);
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

/** Převede offset (east_m, north_m) z centra na geodetický [lon, lat]. */
function makeOffset(
  lat: number,
  lon: number,
  rot: number,
): (east: number, north: number) => [number, number] {
  return (east, north) => {
    const dist = Math.sqrt(east * east + north * north);
    if (dist < 0.1) return [lon, lat];
    const bearing = (Math.atan2(east, north) * 180) / Math.PI + rot;
    return geodesicOffset(lat, lon, dist, bearing);
  };
}

// ── Tvary ────────────────────────────────────────────────────────────────────

function pica(lat: number, lon: number, km: number, rot: number): [number, number][] {
  // Kosočtverec = čtverec otočený o 45° + uživatelská rotace
  const hd = ((km * 1000) / 4) * (Math.sqrt(2) / 2) / DETOUR;
  const corners = cornersFromAngles(lat, lon, hd, [90, 180, 270, 360].map((a) => a + rot));
  return polyWithMids(corners); // 9 bodů
}

function penis(lat: number, lon: number, km: number, rot: number): [number, number][] {
  // Tvar penisu: dřík + zaoblená hlavička
  // Obvod ≈ 2.6 * T (2 strany dříku + půlkruh hlavičky + základna)
  const T = (km * 1000) / (2.6 * DETOUR);
  const SW = T * 0.15;   // polovina šířky dříku
  const HR = T * 0.22;   // poloměr hlavičky (větší než dřík)
  const shaftTop = T * 0.16;  // y kde dřík přechází do hlavičky
  const bottom   = -T * 0.50; // spodní hrana
  const headCy   = shaftTop + HR; // střed hlavičky

  const pt = makeOffset(lat, lon, rot);

  return [
    pt(SW,  bottom),                            // vpravo dole
    pt(SW,  shaftTop),                          // vpravo nahoře dříku
    pt(HR,  headCy),                            // hlavička vpravo (rovník)
    pt(HR * 0.70, headCy + HR * 0.70),          // hlavička vpravo nahoře
    pt(0,   headCy + HR),                       // hlavička vršek
    pt(-HR * 0.70, headCy + HR * 0.70),         // hlavička vlevo nahoře
    pt(-HR, headCy),                            // hlavička vlevo (rovník)
    pt(-SW, shaftTop),                          // vlevo nahoře dříku
    pt(-SW, bottom),                            // vlevo dole
    pt(SW,  bottom),                            // uzavření
  ]; // 10 bodů
}

function heart(lat: number, lon: number, km: number, rot: number): [number, number][] {
  // Parametrická rovnice srdce: x=16sin³(t), y=13cos(t)-5cos(2t)-2cos(3t)-cos(4t)
  // Obvod ≈ 65 parametrických jednotek → scale = (km*1000) / (65*DETOUR)
  const scale = (km * 1000) / (65 * DETOUR);
  const nPts  = 16;
  const pt    = makeOffset(lat, lon, rot);

  const pts: [number, number][] = [];
  // t=π je spodní hrot srdce → začínáme tam, obíháme celé srdce
  for (let i = 0; i <= nPts; i++) {
    const t = Math.PI + (i / nPts) * 2 * Math.PI;
    const x =  16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    pts.push(pt(x * scale, y * scale));
  }
  return pts; // 17 bodů, uzavřeno (první = poslední)
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
