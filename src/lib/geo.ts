/** Posune bod (lat, lon) o distanceM metrů v daném směru (bearing 0=sever).
 *  Vrací [lon, lat] – GeoJSON pořadí. */
export function geodesicOffset(
  lat: number,
  lon: number,
  distanceM: number,
  bearingDeg: number,
): [number, number] {
  const R = 6371000;
  const b = (bearingDeg * Math.PI) / 180;
  const d = distanceM / R;
  const φ1 = (lat * Math.PI) / 180;
  const λ1 = (lon * Math.PI) / 180;
  const φ2 = Math.asin(
    Math.sin(φ1) * Math.cos(d) + Math.cos(φ1) * Math.sin(d) * Math.cos(b),
  );
  const λ2 =
    λ1 +
    Math.atan2(
      Math.sin(b) * Math.sin(d) * Math.cos(φ1),
      Math.cos(d) - Math.sin(φ1) * Math.sin(φ2),
    );
  return [(λ2 * 180) / Math.PI, (φ2 * 180) / Math.PI];
}

/** Střed mezi dvěma body [lon, lat].
 *  Používá aritmetický průměr – přesné pouze pro blízké body (< ~50 km). */
export function midpoint(
  a: [number, number],
  b: [number, number],
): [number, number] {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}
