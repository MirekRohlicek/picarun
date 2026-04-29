import { generateWaypoints, type ShapeId } from './shapes';
import { fetchRoute, type OrsResult } from './ors';

export interface GenerateResult extends OrsResult {
  iterations: number;
}

/** Vygeneruje trasu s iterativní kalibrací délky.
 *  Max 3 ORS volání, cílová odchylka ≤ 5 %. */
export async function generateRoute(
  shape: ShapeId,
  lat: number,
  lon: number,
  targetKm: number,
  rotationDeg: number,
  apiKey: string,
): Promise<GenerateResult> {
  const targetM = targetKm * 1000;
  let kmScale = 1.0;
  let result: OrsResult = { distanceM: 0, coordinates: [] };
  let iterations = 0;

  for (let i = 0; i < 3; i++) {
    iterations = i + 1;
    const waypoints = generateWaypoints(shape, lat, lon, targetKm * kmScale, rotationDeg);
    result = await fetchRoute(waypoints, apiKey);

    const deviation = Math.abs(result.distanceM - targetM) / targetM;
    if (deviation <= 0.05) break;

    // Škálování: pokud ORS vrátil kratší trasu, zvětšíme tvar a naopak
    kmScale *= targetM / result.distanceM;
  }

  return { ...result, iterations };
}
