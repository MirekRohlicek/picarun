# Pica Run MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Responzivní webová aplikace pro generování pěších tras v geometrických tvarech pomocí ORS API a Mapy.cz tiles.

**Architecture:** React 18 + Vite + TypeScript, čistá separace: `geo.ts` (geometrie) → `shapes.ts` (waypointy) → `ors.ts` (API fetch) → `generate.ts` (kalibrační smyčka) → Zustand store → React komponenty. Mapa přes MapLibre GL JS s Mapy.cz raster tiles.

**Tech Stack:** React 18, Vite 5, TypeScript, Tailwind CSS 3, MapLibre GL JS 4, Zustand 5, Vitest

---

## Soubory projektu

```
PicaRun/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── tailwind.config.ts
├── postcss.config.js
├── .env                          ← přidat VITE_ prefix k existujícím klíčům
├── .env.example                  ← nový
├── src/
│   ├── main.tsx
│   ├── App.tsx                   ← responzivní layout, GPS init
│   ├── index.css                 ← Tailwind + CSS vars
│   ├── lib/
│   │   ├── geo.ts                ← geodesicOffset, midpoint
│   │   ├── geo.test.ts
│   │   ├── shapes.ts             ← generateWaypoints pro 5 tvarů
│   │   ├── shapes.test.ts
│   │   ├── ors.ts                ← fetchRoute (ORS API call)
│   │   ├── ors.test.ts
│   │   ├── generate.ts           ← kalibrační smyčka (volá shapes + ors)
│   │   └── generate.test.ts
│   ├── store/
│   │   └── useAppStore.ts        ← Zustand store
│   └── components/
│       ├── MapView.tsx           ← MapLibre mapa s trasou
│       ├── ShapePicker.tsx       ← 5 tvarů, aktivní stav
│       ├── KmInput.tsx           ← číselný input pro km
│       ├── RotateButton.tsx      ← tlačítko +45° s zobrazením stupňů
│       ├── GenerateButton.tsx    ← hlavní CTA
│       ├── RouteResult.tsx       ← zobrazení délky trasy
│       ├── GeoStatus.tsx         ← stav GPS určení polohy
│       └── Panel.tsx             ← levý panel (obal komponent)
```

---

## Task 1: Project scaffold

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/index.css`
- Create: `.env.example`
- Modify: `.env`

- [ ] **Krok 1: Vytvoř `package.json`**

```json
{
  "name": "pica-run",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "maplibre-gl": "^4.7.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "zustand": "^5.0.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.3",
    "autoprefixer": "^10.4.20",
    "jsdom": "^25.0.1",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.14",
    "typescript": "^5.6.3",
    "vite": "^5.4.10",
    "vitest": "^2.1.4"
  }
}
```

- [ ] **Krok 2: Vytvoř `vite.config.ts`**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
```

- [ ] **Krok 3: Vytvoř `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Krok 4: Vytvoř `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts", "tailwind.config.ts", "postcss.config.js"]
}
```

- [ ] **Krok 5: Vytvoř `tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent:    '#FF6A4A',
        bg:        '#0F1226',
        panel:     '#2E3251',
        secondary: '#5A5F7E',
        cream:     '#FCF8F4',
      },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Krok 6: Vytvoř `postcss.config.js`**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Krok 7: Vytvoř `index.html`**

```html
<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Pica Run</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Krok 8: Vytvoř `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-bg text-cream min-h-screen;
  }
}
```

- [ ] **Krok 9: Vytvoř `src/main.tsx`**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Krok 10: Vytvoř dočasné `src/App.tsx` (placeholder)**

```tsx
export default function App() {
  return <div className="p-8 text-cream">Pica Run – loading…</div>;
}
```

- [ ] **Krok 11: Vytvoř `.env.example`**

```
VITE_ORS_API_KEY=your_ors_key_here
VITE_MAPY_CZ_API_KEY=your_mapy_cz_key_here
```

- [ ] **Krok 12: Uprav `.env` – přidej VITE_ prefix**

```
VITE_ORS_API_KEY=eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImU1NWFiZjRjNzNlODQ5YjlhMmE3YjIwYzhhYjZiMjdhIiwiaCI6Im11cm11cjY0In0=
VITE_MAPY_CZ_API_KEY=-9fnibO1PP26G0kjqV0WYhnKkNzO65_P0WTlHVxxDDk
```

- [ ] **Krok 13: Nainstaluj závislosti**

```bash
cd C:\Users\rohli\Desktop\CC\PicaRun
npm install
```

Očekávaný výstup: `added N packages`

- [ ] **Krok 14: Ověř dev server**

```bash
npm run dev
```

Očekávaný výstup: `Local: http://localhost:5173/` — otevři v prohlížeči, zobrazí se „Pica Run – loading…"

- [ ] **Krok 15: Commit**

```bash
git add package.json vite.config.ts tsconfig.json tsconfig.node.json tailwind.config.ts postcss.config.js index.html src/ .env.example
git commit -m "feat: scaffold React+Vite+TS+Tailwind project"
```

---

## Task 2: `geo.ts` – geometrické utility

**Files:**
- Create: `src/lib/geo.ts`
- Create: `src/lib/geo.test.ts`

- [ ] **Krok 1: Napiš failing testy do `src/lib/geo.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { geodesicOffset, midpoint } from './geo';

describe('geodesicOffset', () => {
  it('nulová vzdálenost vrátí stejný bod', () => {
    const [lon, lat] = geodesicOffset(50.0, 14.0, 0, 0);
    expect(lat).toBeCloseTo(50.0, 4);
    expect(lon).toBeCloseTo(14.0, 4);
  });

  it('posun na sever o 1 km zvýší lat', () => {
    const [lon, lat] = geodesicOffset(50.0, 14.0, 1000, 0);
    expect(lat).toBeGreaterThan(50.0);
    expect(lat).toBeCloseTo(50.009, 2);
    expect(lon).toBeCloseTo(14.0, 3);
  });

  it('posun na východ o 1 km zvýší lon', () => {
    const [lon, lat] = geodesicOffset(50.0, 14.0, 1000, 90);
    expect(lon).toBeGreaterThan(14.0);
    expect(lat).toBeCloseTo(50.0, 3);
  });

  it('sever a jih jsou symetrické kolem středu', () => {
    const [, latN] = geodesicOffset(50.0, 14.0, 1000, 0);
    const [, latS] = geodesicOffset(50.0, 14.0, 1000, 180);
    expect(latN - 50.0).toBeCloseTo(50.0 - latS, 3);
  });

  it('vrací [lon, lat] (lon první)', () => {
    const result = geodesicOffset(50.0, 14.0, 1000, 0);
    expect(result).toHaveLength(2);
    // lon (14.x) je menší než lat (50.x)
    expect(result[0]).toBeLessThan(result[1]);
  });
});

describe('midpoint', () => {
  it('vrátí průměr dvou bodů', () => {
    const mid = midpoint([0, 0], [4, 2]);
    expect(mid).toEqual([2, 1]);
  });

  it('stejný bod vrátí stejný bod', () => {
    const mid = midpoint([14.5, 50.1], [14.5, 50.1]);
    expect(mid).toEqual([14.5, 50.1]);
  });
});
```

- [ ] **Krok 2: Spusť testy – ověř že failují**

```bash
npm test
```

Očekávaný výstup: `Cannot find module './geo'`

- [ ] **Krok 3: Implementuj `src/lib/geo.ts`**

```typescript
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

/** Střed mezi dvěma body [lon, lat]. */
export function midpoint(
  a: [number, number],
  b: [number, number],
): [number, number] {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}
```

- [ ] **Krok 4: Spusť testy – ověř že prochází**

```bash
npm test
```

Očekávaný výstup: `✓ geo.test.ts (7 tests)`

- [ ] **Krok 5: Commit**

```bash
git add src/lib/geo.ts src/lib/geo.test.ts
git commit -m "feat: add geo utilities (geodesicOffset, midpoint)"
```

---

## Task 3: `shapes.ts` – generátory waypointů

**Files:**
- Create: `src/lib/shapes.ts`
- Create: `src/lib/shapes.test.ts`

- [ ] **Krok 1: Napiš failing testy do `src/lib/shapes.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { generateWaypoints, SHAPE_IDS } from './shapes';

const C = { lat: 50.0755, lon: 14.4378 };
const KM = 5;

describe('generateWaypoints', () => {
  describe('diamond', () => {
    it('vrátí 9 waypointů', () => {
      expect(generateWaypoints('diamond', C.lat, C.lon, KM, 0)).toHaveLength(9);
    });
    it('první a poslední bod jsou stejné (uzavřený)', () => {
      const wps = generateWaypoints('diamond', C.lat, C.lon, KM, 0);
      expect(wps[0]).toEqual(wps[wps.length - 1]);
    });
    it('všechny body jsou blízko středu (< 0.2°)', () => {
      const wps = generateWaypoints('diamond', C.lat, C.lon, KM, 0);
      wps.forEach(([lon, lat]) => {
        expect(Math.abs(lat - C.lat)).toBeLessThan(0.2);
        expect(Math.abs(lon - C.lon)).toBeLessThan(0.2);
      });
    });
  });

  describe('circle', () => {
    it('vrátí 25 waypointů', () => {
      expect(generateWaypoints('circle', C.lat, C.lon, KM, 0)).toHaveLength(25);
    });
    it('první a poslední bod jsou stejné', () => {
      const wps = generateWaypoints('circle', C.lat, C.lon, KM, 0);
      expect(wps[0]).toEqual(wps[wps.length - 1]);
    });
  });

  describe('square', () => {
    it('vrátí 9 waypointů', () => {
      expect(generateWaypoints('square', C.lat, C.lon, KM, 0)).toHaveLength(9);
    });
    it('je uzavřený', () => {
      const wps = generateWaypoints('square', C.lat, C.lon, KM, 0);
      expect(wps[0]).toEqual(wps[wps.length - 1]);
    });
  });

  describe('triangle', () => {
    it('vrátí 7 waypointů', () => {
      expect(generateWaypoints('triangle', C.lat, C.lon, KM, 0)).toHaveLength(7);
    });
    it('je uzavřený', () => {
      const wps = generateWaypoints('triangle', C.lat, C.lon, KM, 0);
      expect(wps[0]).toEqual(wps[wps.length - 1]);
    });
  });

  describe('pentagon', () => {
    it('vrátí 11 waypointů', () => {
      expect(generateWaypoints('pentagon', C.lat, C.lon, KM, 0)).toHaveLength(11);
    });
    it('je uzavřený', () => {
      const wps = generateWaypoints('pentagon', C.lat, C.lon, KM, 0);
      expect(wps[0]).toEqual(wps[wps.length - 1]);
    });
  });

  it('rotace posune waypointy (ne nulová odchylka od nerotovaných)', () => {
    const base = generateWaypoints('square', C.lat, C.lon, KM, 0);
    const rotated = generateWaypoints('square', C.lat, C.lon, KM, 45);
    // alespoň jeden bod se liší
    expect(base[0]).not.toEqual(rotated[0]);
  });

  it('SHAPE_IDS obsahuje 5 tvarů', () => {
    expect(SHAPE_IDS).toHaveLength(5);
  });
});
```

- [ ] **Krok 2: Spusť testy – ověř že failují**

```bash
npm test
```

Očekávaný výstup: `Cannot find module './shapes'`

- [ ] **Krok 3: Implementuj `src/lib/shapes.ts`**

```typescript
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
```

- [ ] **Krok 4: Spusť testy – ověř že prochází**

```bash
npm test
```

Očekávaný výstup: `✓ shapes.test.ts (13 tests)`

- [ ] **Krok 5: Commit**

```bash
git add src/lib/shapes.ts src/lib/shapes.test.ts
git commit -m "feat: add shape waypoint generators (5 shapes)"
```

---

## Task 4: `ors.ts` – ORS API fetch

**Files:**
- Create: `src/lib/ors.ts`
- Create: `src/lib/ors.test.ts`

- [ ] **Krok 1: Napiš failing testy do `src/lib/ors.test.ts`**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchRoute } from './ors';

const MOCK_RESPONSE = {
  features: [{
    geometry: { type: 'LineString', coordinates: [[14.44, 50.08], [14.45, 50.09]] },
    properties: { summary: { distance: 5100, duration: 3720 } },
  }],
};

describe('fetchRoute', () => {
  beforeEach(() => vi.resetAllMocks());

  it('vrátí distanceM a coordinates při úspěchu', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => MOCK_RESPONSE,
    } as Response);

    const result = await fetchRoute([[14.44, 50.08], [14.45, 50.09]], 'test-key');
    expect(result.distanceM).toBe(5100);
    expect(result.coordinates).toHaveLength(2);
    expect(result.coordinates[0]).toEqual([14.44, 50.08]);
  });

  it('pošle Authorization header s klíčem', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => MOCK_RESPONSE,
    } as Response);

    await fetchRoute([[14.44, 50.08]], 'my-secret-key');
    const call = vi.mocked(global.fetch).mock.calls[0];
    const init = call[1] as RequestInit;
    expect((init.headers as Record<string, string>)['Authorization']).toBe('my-secret-key');
  });

  it('vyhodí chybu při HTTP 403', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      json: async () => ({ error: { message: 'Invalid API key' } }),
    } as Response);

    await expect(fetchRoute([[14.44, 50.08]], 'bad-key')).rejects.toThrow('ORS 403');
  });

  it('vyhodí chybu při HTTP 429 (rate limit)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      json: async () => ({}),
    } as Response);

    await expect(fetchRoute([[14.44, 50.08]], 'key')).rejects.toThrow('ORS 429');
  });
});
```

- [ ] **Krok 2: Spusť testy – ověř že failují**

```bash
npm test
```

Očekávaný výstup: `Cannot find module './ors'`

- [ ] **Krok 3: Implementuj `src/lib/ors.ts`**

```typescript
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
```

- [ ] **Krok 4: Spusť testy – ověř že prochází**

```bash
npm test
```

Očekávaný výstup: `✓ ors.test.ts (4 tests)`

- [ ] **Krok 5: Commit**

```bash
git add src/lib/ors.ts src/lib/ors.test.ts
git commit -m "feat: add ORS API fetch with error handling"
```

---

## Task 5: `generate.ts` – kalibrační smyčka

**Files:**
- Create: `src/lib/generate.ts`
- Create: `src/lib/generate.test.ts`

- [ ] **Krok 1: Napiš failing testy do `src/lib/generate.test.ts`**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateRoute } from './generate';

function mockOrs(distanceM: number) {
  return {
    ok: true,
    json: async () => ({
      features: [{
        geometry: { type: 'LineString', coordinates: [[14.44, 50.08]] },
        properties: { summary: { distance: distanceM } },
      }],
    }),
  } as Response;
}

describe('generateRoute – kalibrace', () => {
  beforeEach(() => vi.resetAllMocks());

  it('1 iterace pokud odchylka ≤ 5 %', async () => {
    // Target 5 km, ORS vrátí 5 100 m (2 % odchylka)
    global.fetch = vi.fn().mockResolvedValue(mockOrs(5100));
    const result = await generateRoute('diamond', 50.0755, 14.4378, 5, 0, 'key');
    expect(result.iterations).toBe(1);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('2 iterace pokud první odchylka > 5 %', async () => {
    // První volání: 4 000 m (20 % odchylka), druhé: 5 050 m (1 %)
    global.fetch = vi.fn()
      .mockResolvedValueOnce(mockOrs(4000))
      .mockResolvedValueOnce(mockOrs(5050));
    const result = await generateRoute('diamond', 50.0755, 14.4378, 5, 0, 'key');
    expect(result.iterations).toBe(2);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('max 3 iterace i když nedosáhne 5 %', async () => {
    global.fetch = vi.fn().mockResolvedValue(mockOrs(4000));
    const result = await generateRoute('diamond', 50.0755, 14.4378, 5, 0, 'key');
    expect(result.iterations).toBe(3);
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('vrátí distanceM z posledního volání', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce(mockOrs(4000))
      .mockResolvedValueOnce(mockOrs(5050));
    const result = await generateRoute('diamond', 50.0755, 14.4378, 5, 0, 'key');
    expect(result.distanceM).toBe(5050);
  });
});
```

- [ ] **Krok 2: Spusť testy – ověř že failují**

```bash
npm test
```

Očekávaný výstup: `Cannot find module './generate'`

- [ ] **Krok 3: Implementuj `src/lib/generate.ts`**

```typescript
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
```

- [ ] **Krok 4: Spusť testy – ověř že prochází**

```bash
npm test
```

Očekávaný výstup: `✓ generate.test.ts (4 tests)` + všechny předchozí testy zelené

- [ ] **Krok 5: Commit**

```bash
git add src/lib/generate.ts src/lib/generate.test.ts
git commit -m "feat: add calibration loop (max 3 ORS iterations, ±5% target)"
```

---

## Task 6: Zustand store

**Files:**
- Create: `src/store/useAppStore.ts`

- [ ] **Krok 1: Vytvoř `src/store/useAppStore.ts`**

```typescript
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
```

- [ ] **Krok 2: Ověř TypeScript**

```bash
npx tsc --noEmit
```

Očekávaný výstup: žádné chyby

- [ ] **Krok 3: Commit**

```bash
git add src/store/useAppStore.ts
git commit -m "feat: add Zustand store (shape, km, rotation, GPS, route state)"
```

---

## Task 7: `MapView.tsx` – MapLibre mapa

**Files:**
- Create: `src/components/MapView.tsx`

- [ ] **Krok 1: Vytvoř `src/components/MapView.tsx`**

```tsx
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
```

- [ ] **Krok 2: Ověř TypeScript**

```bash
npx tsc --noEmit
```

Očekávaný výstup: žádné chyby

- [ ] **Krok 3: Commit**

```bash
git add src/components/MapView.tsx
git commit -m "feat: add MapLibre MapView component with Mapy.cz tiles"
```

---

## Task 8: UI komponenty

**Files:**
- Create: `src/components/ShapePicker.tsx`
- Create: `src/components/KmInput.tsx`
- Create: `src/components/RotateButton.tsx`
- Create: `src/components/GenerateButton.tsx`
- Create: `src/components/RouteResult.tsx`
- Create: `src/components/GeoStatus.tsx`

- [ ] **Krok 1: Vytvoř `src/components/ShapePicker.tsx`**

```tsx
import { SHAPE_IDS, SHAPE_LABELS, type ShapeId } from '../lib/shapes';
import { useAppStore } from '../store/useAppStore';

const SHAPE_ICONS: Record<ShapeId, React.ReactNode> = {
  diamond:  <polygon points="12,2 22,12 12,22 2,12" />,
  circle:   <circle cx="12" cy="12" r="10" />,
  square:   <rect x="2" y="2" width="20" height="20" />,
  triangle: <polygon points="12,2 22,21 2,21" />,
  pentagon: <polygon points="12,2 22,9 18,21 6,21 2,9" />,
};

export function ShapePicker() {
  const { shape, setShape } = useAppStore();

  return (
    <div className="flex gap-2">
      {SHAPE_IDS.map((id) => (
        <button
          key={id}
          onClick={() => setShape(id)}
          className={[
            'flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg border text-xs transition-colors',
            id === shape
              ? 'border-accent text-accent bg-accent/10'
              : 'border-panel text-secondary bg-panel hover:border-secondary',
          ].join(' ')}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="w-5 h-5"
          >
            {SHAPE_ICONS[id]}
          </svg>
          {SHAPE_LABELS[id]}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Krok 2: Vytvoř `src/components/KmInput.tsx`**

```tsx
import { useAppStore } from '../store/useAppStore';

export function KmInput() {
  const { km, setKm } = useAppStore();

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] uppercase tracking-widest text-secondary">
        Délka trasy
      </label>
      <div className="flex items-center gap-2 bg-panel border border-panel rounded-lg px-3 py-2">
        <input
          type="number"
          min={0.5}
          max={100}
          step={0.5}
          value={km}
          onChange={(e) => setKm(Number(e.target.value))}
          className="flex-1 bg-transparent text-cream text-sm font-semibold outline-none w-0"
        />
        <span className="text-secondary text-xs shrink-0">km</span>
      </div>
    </div>
  );
}
```

- [ ] **Krok 3: Vytvoř `src/components/RotateButton.tsx`**

```tsx
import { useAppStore } from '../store/useAppStore';

export function RotateButton() {
  const { rotationDeg, rotate } = useAppStore();

  return (
    <button
      onClick={rotate}
      className="flex items-center gap-2 bg-panel border border-panel rounded-lg px-3 py-2 text-cream text-xs hover:border-secondary transition-colors shrink-0"
    >
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
        <path d="M13.5 8A5.5 5.5 0 1 1 8 2.5" />
        <polyline points="8,0.5 11,2.5 8,4.5" />
      </svg>
      <span className="text-secondary">{rotationDeg}°</span>
    </button>
  );
}
```

- [ ] **Krok 4: Vytvoř `src/components/GenerateButton.tsx`**

```tsx
import { useAppStore } from '../store/useAppStore';
import { generateRoute } from '../lib/generate';

const ORS_KEY = import.meta.env.VITE_ORS_API_KEY as string;

export function GenerateButton() {
  const { shape, km, rotationDeg, lat, lon, generating, startGenerating, setRoute, setError } =
    useAppStore();

  const handleClick = async () => {
    startGenerating();
    try {
      const result = await generateRoute(shape, lat, lon, km, rotationDeg, ORS_KEY);
      setRoute(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při generování trasy');
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={generating}
      className="w-full py-3 rounded-xl bg-accent text-cream font-bold tracking-widest text-sm uppercase transition-opacity disabled:opacity-50"
    >
      {generating ? 'Generuji…' : 'Generovat trasu'}
    </button>
  );
}
```

- [ ] **Krok 5: Vytvoř `src/components/RouteResult.tsx`**

```tsx
import { useAppStore } from '../store/useAppStore';

export function RouteResult() {
  const { route, error } = useAppStore();

  if (error) {
    return (
      <div className="rounded-xl bg-red-950 border border-red-800 px-4 py-3 text-red-400 text-xs leading-relaxed">
        {error}
      </div>
    );
  }

  if (!route) return null;

  const km = (route.distanceM / 1000).toFixed(2);

  return (
    <div className="rounded-xl bg-panel px-4 py-3 flex items-baseline gap-2">
      <span className="text-4xl font-black text-accent">{km}</span>
      <span className="text-secondary text-sm">km</span>
    </div>
  );
}
```

- [ ] **Krok 6: Vytvoř `src/components/GeoStatus.tsx`**

```tsx
import { useAppStore } from '../store/useAppStore';

export function GeoStatus() {
  const { gpsStatus, gpsMessage } = useAppStore();

  const colors: Record<typeof gpsStatus, string> = {
    idle:    'text-secondary',
    loading: 'text-secondary animate-pulse',
    ok:      'text-green-400',
    error:   'text-red-400',
  };

  const icons: Record<typeof gpsStatus, string> = {
    idle:    '◎',
    loading: '◌',
    ok:      '●',
    error:   '✕',
  };

  return (
    <div className={`text-[10px] flex items-center gap-1.5 ${colors[gpsStatus]}`}>
      <span>{icons[gpsStatus]}</span>
      <span>{gpsMessage || 'Poloha'}</span>
    </div>
  );
}
```

- [ ] **Krok 7: Ověř TypeScript**

```bash
npx tsc --noEmit
```

Očekávaný výstup: žádné chyby

- [ ] **Krok 8: Commit**

```bash
git add src/components/
git commit -m "feat: add UI components (ShapePicker, KmInput, RotateButton, GenerateButton, RouteResult, GeoStatus)"
```

---

## Task 9: `Panel.tsx` + `App.tsx` – layout a GPS

**Files:**
- Create: `src/components/Panel.tsx`
- Modify: `src/App.tsx`

- [ ] **Krok 1: Vytvoř `src/components/Panel.tsx`**

```tsx
import { ShapePicker } from './ShapePicker';
import { KmInput } from './KmInput';
import { RotateButton } from './RotateButton';
import { GenerateButton } from './GenerateButton';
import { RouteResult } from './RouteResult';
import { GeoStatus } from './GeoStatus';

export function Panel() {
  return (
    <div className="flex flex-col h-full overflow-y-auto bg-bg border-r border-panel">
      {/* Hlavička */}
      <div className="px-4 py-4 border-b border-panel shrink-0">
        <h1 className="text-lg font-black tracking-[0.2em] text-cream">
          PICA<span className="text-accent">RUN</span>
        </h1>
      </div>

      <div className="flex flex-col gap-5 px-4 py-4 flex-1">
        {/* Tvar */}
        <div className="flex flex-col gap-2">
          <p className="text-[9px] uppercase tracking-widest text-secondary">Tvar trasy</p>
          <ShapePicker />
        </div>

        {/* GPS */}
        <div className="flex flex-col gap-1">
          <p className="text-[9px] uppercase tracking-widest text-secondary">Výchozí bod</p>
          <div className="bg-panel rounded-lg px-3 py-2">
            <GeoStatus />
          </div>
        </div>

        {/* Délka + Rotace */}
        <div className="flex flex-col gap-2">
          <p className="text-[9px] uppercase tracking-widest text-secondary">Parametry</p>
          <div className="flex gap-2">
            <div className="flex-1">
              <KmInput />
            </div>
            <div className="flex items-end">
              <RotateButton />
            </div>
          </div>
        </div>

        {/* Generovat */}
        <GenerateButton />

        {/* Výsledek */}
        <RouteResult />
      </div>
    </div>
  );
}
```

- [ ] **Krok 2: Nahraď `src/App.tsx` finální verzí**

```tsx
import { useEffect } from 'react';
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

  const center: [number, number] = [lon, lat];

  return (
    <div className="flex h-screen overflow-hidden">

      {/* ── Desktop: panel + mapa vždy vedle sebe ── */}
      <div className="hidden md:flex w-full">
        <div className="w-72 shrink-0">
          <Panel />
        </div>
        <div className="flex-1 relative">
          <MapView center={center} route={route} />
          {route && (
            <KmPill distanceM={route.distanceM} />
          )}
        </div>
      </div>

      {/* ── Mobil: přepínání panel / mapa ── */}
      <div className="flex md:hidden w-full flex-col">
        {view === 'panel' ? (
          <Panel />
        ) : (
          <div className="relative flex-1">
            <MapView center={center} route={route} />
            {route && <KmPill distanceM={route.distanceM} />}
            <button
              onClick={() => setView('panel')}
              className="absolute top-3 left-3 bg-bg/90 backdrop-blur border border-panel rounded-lg px-3 py-1.5 text-xs text-cream"
            >
              ← Zpět
            </button>
          </div>
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
```

- [ ] **Krok 3: Ověř TypeScript**

```bash
npx tsc --noEmit
```

Očekávaný výstup: žádné chyby

- [ ] **Krok 4: Spusť dev server a ověř vizuálně**

```bash
npm run dev
```

Otevři `http://localhost:5173`:
- Panel s logem PICARUN vlevo
- 5 tvarů v řadě (kosočtverec první, aktivní)
- GPS status se načte (nebo zobrazí chybu pokud file://)
- Tlačítko Generovat trasu
- Na desktopu: mapa vpravo, na mobilu: jen panel

- [ ] **Krok 5: Všechny testy prochází**

```bash
npm test
```

Očekávaný výstup: všechny testy zelené (geo + shapes + ors + generate)

- [ ] **Krok 6: Commit**

```bash
git add src/App.tsx src/components/Panel.tsx
git commit -m "feat: add Panel + App with responsive layout and GPS init"
```

---

## Task 10: Build, .gitignore, push

**Files:**
- Modify: `.gitignore`

- [ ] **Krok 1: Přidej `dist/` a `node_modules/` do `.gitignore`**

Otevři `.gitignore` a přidej:
```
node_modules/
dist/
.env
*.local
```

- [ ] **Krok 2: Spusť produkční build**

```bash
npm run build
```

Očekávaný výstup: `dist/` složka s `index.html` + assets, žádné chyby

- [ ] **Krok 3: Ověř produkční build**

```bash
npm run preview
```

Otevři `http://localhost:4173` – aplikace funguje stejně jako dev server.

- [ ] **Krok 4: Commitni a pushnni**

```bash
git add -A
git commit -m "feat: complete Pica Run MVP"
git push origin main
```

---

## Self-review checklist

**Spec coverage:**
- [x] GPS při načtení → `App.tsx useEffect`
- [x] Kosočtverec první a výchozí → `SHAPE_IDS[0]`, `shape: 'diamond'` v store
- [x] Iterativní kalibrace → `generate.ts` max 3 iterace
- [x] Jen délka trasy → `RouteResult.tsx` zobrazuje jen km
- [x] Tlačítko Otočit → `RotateButton.tsx` + `rotate()` v store
- [x] Responzivní layout → `md:` breakpoint v `App.tsx`
- [x] API klíče v `.env` → `import.meta.env.VITE_*`
- [x] Mapy.cz tiles → `MapView.tsx`
- [x] ORS routing → `ors.ts` + `generate.ts`

**Placeholder scan:** žádné TBD, žádné „implement later"

**Type consistency:**
- `clearRoute(map)` a `drawRoute(map, coordinates)` konzistentní v `MapView.tsx`
- `ShapeId` exportován z `shapes.ts`, importován v `store`, `generate.ts`, `GenerateButton.tsx`
- `GenerateResult` z `generate.ts` použit v store a `RouteResult.tsx`
