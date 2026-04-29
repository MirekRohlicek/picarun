const ORS_URL =
  'https://api.openrouteservice.org/v2/directions/foot-walking/geojson';

export interface OrsResult {
  distanceM: number;
  coordinates: [number, number][];
}

/** Zavolá ORS routing API. Vyhodí Error při non-2xx odpovědi. */
export async function fetchRoute(
  waypoints: [number, number][],
  apiKey: string,
): Promise<OrsResult> {
  const res = await fetch(ORS_URL, {
    method: 'POST',
    headers: {
      Authorization: apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/geo+json',
    },
    body: JSON.stringify({ coordinates: waypoints }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(`ORS ${res.status}: ${body.error?.message ?? res.statusText}`);
  }

  const data = await res.json() as {
    features: Array<{
      geometry: { coordinates: [number, number][] };
      properties: { summary: { distance: number } };
    }>;
  };

  const feature = data.features[0];
  return {
    distanceM: feature.properties.summary.distance,
    coordinates: feature.geometry.coordinates,
  };
}
