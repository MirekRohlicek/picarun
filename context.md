# Pica Run – Projektový kontext

## Co je Pica Run

Mobilní aplikace (React Native, iOS + Android) pro plánování pěších/běžeckých tras ve vizuálně zajímavých tvarech – kruh, čtverec, trojúhelník, hvězda, pětiúhelník a další. Uživatel zadá požadovanou vzdálenost v km, vybere tvar a volitelně rotaci. App vygeneruje reálnou pěší trasu po reálných cestách. Výchozí bod se určuje z GPS polohy zařízení.

---

## Technická architektura (finální rozhodnutí)

| Oblast | Řešení | Důvod |
|---|---|---|
| Routing | **OpenRouteService (ORS)** | 50 waypointů/req (vs 15 u Mapy.cz), lepší přesnost tvarů |
| Mapa / tiles | **Mapy.cz** | Nejlepší vizuální kvalita pro ČR, API klíč máme |
| Platforma | **React Native (TypeScript)** | Cross-platform iOS + Android |
| Geolokace | `expo-location` / `navigator.geolocation` | Nativní GPS |
| State | Zustand | Jednoduchý, bez boilerplate |

### Proč ORS místo Mapy.cz pro routing

- Mapy.cz routing: max **15 waypointů** / request → složité tvary potřebují 2–3 requesty
- ORS: max **50 waypointů** / request → všechny tvary v 1 requestu
- Cena ORS: 2 000 req/den zdarma (stačí pro vývoj), pak €4/1 000 req
- Mapy.cz tiles zůstávají pro zobrazení mapy

### Proč ne Valhalla Meili

Meili je **map matching** (oprava GPS záznamu), ne routing. Pro generování nových tras ho nepotřebujeme.

---

## API klíče

> **Klíče nejsou v repozitáři** – jsou v `.env` (viz `.gitignore`).

| Služba | Proměnná v .env | Kde získat |
|---|---|---|
| Mapy.cz | `MAPY_CZ_API_KEY` | developer.mapy.com |
| OpenRouteService | `ORS_API_KEY` | openrouteservice.org/dev |

---

## Mapy.cz REST API

### Tile vrstva (mapa)

```
https://api.mapy.cz/v1/maptiles/outdoor/256/{z}/{x}/{y}?apikey=KEY
```

Funguje v MapLibre GL jako `type: 'raster'`.

### Routing endpoint (záloha / reference)

```
GET https://api.mapy.cz/v1/routing/route
  ?apikey=KEY
  &routeType=foot_fast        # podtržítko, ne pomlčka
  &start=lon,lat              # lon PRVNÍ
  &end=lon,lat
  &waypoints=lon,lat|lon,lat  # max 15 bodů celkem
  &format=geojson
```

**Koordináty:** `lon,lat` (zeměpisná délka první).
**Pozor:** Endpoint `/v1/route` ani `/v1/routing` nefungují – správný je `/v1/routing/route`.

---

## OpenRouteService API

### Routing endpoint (primární)

```
POST https://api.openrouteservice.org/v2/directions/foot-walking/geojson

Headers:
  Authorization: ORS_API_KEY
  Content-Type: application/json

Body:
{
  "coordinates": [[lon1, lat1], [lon2, lat2], ...]  // lon první (GeoJSON)
}
```

**Pěší profily:** `foot-walking` (rychlá chůze), `foot-hiking` (turistické stezky)
**Max waypointů:** 50
**Free limit:** 2 000 req/den
**Odpověď:** GeoJSON FeatureCollection – `features[0].properties.summary.distance` (metry), `.duration` (sekundy)

---

## Generování tvarů

### Princip

```
1. ShapeGenerator vypočítá souřadnice waypointů tvaru (matematika, bez API)
2. ORS API dostane waypointy → vrátí reálnou trasu po cestách
3. Trasa se vykreslí na mapě (MapLibre GL + Mapy.cz tiles)
```

### Detour faktor

Reálná trasa po silnicích je delší než vzdušná vzdálenost. Koeficient `DETOUR = 1.18` slouží k předběžnému škálování poloměru tvaru. Skutečná odchylka závisí na hustotě zástavby (typicky 10–25 %).

### Tvary (implementováno v test_square_route.html)

| Tvar | Waypointů | Výpočet poloměru |
|---|---|---|
| Kruh | 25 (24 bodů + uzavření) | `R = km / (2π × DETOUR)` |
| Čtverec | 9 (4 rohy + 4 středobody stran + uzavření) | `halfDiag = (km/4 × √2/2) / DETOUR` |
| Trojúhelník | 7 (3 rohy + 3 středobody + uzavření) | `R = (km/3) / (√3 × DETOUR)` |
| Hvězda (5cípá) | 11 (5 vnějších + 5 vnitřních + uzavření) | `R_outer = km / (7.27 × DETOUR)`, `R_inner = R × 0.382` |
| Pětiúhelník | 11 (5 rohů + 5 středobodů + uzavření) | `R = km / (5 × 2 × sin(π/5) × DETOUR)` |

### Klíčová funkce – geodesicOffset

```javascript
// Posune bod o distM metrů v daném směru (bearing v stupních, 0=sever)
// Vrací [lon, lat] – GeoJSON formát
function geodesicOffset(lat, lon, distM, bearingDeg) {
  const R = 6371000;
  const b = bearingDeg * Math.PI / 180, d = distM / R;
  const φ1 = lat * Math.PI / 180, λ1 = lon * Math.PI / 180;
  const φ2 = Math.asin(Math.sin(φ1)*Math.cos(d) + Math.cos(φ1)*Math.sin(d)*Math.cos(b));
  const λ2 = λ1 + Math.atan2(Math.sin(b)*Math.sin(d)*Math.cos(φ1), Math.cos(d)-Math.sin(φ1)*Math.sin(φ2));
  return [λ2*180/Math.PI, φ2*180/Math.PI];
}
```

---

## Geolokace

**Problém:** Chrome blokuje `navigator.geolocation` pro `file://` URL.
**Řešení:** Spustit `start_server.bat` → otevřít `http://localhost:8080`.

**Správné nastavení (rychlé, přes WiFi/síť):**
```javascript
navigator.geolocation.getCurrentPosition(success, error, {
  timeout: 15000,
  maximumAge: 300000,
  enableHighAccuracy: false  // false = rychlé (WiFi), true = přesné GPS (pomalé)
});
```

---

## Soubory projektu

| Soubor | Popis | V gitu? |
|---|---|---|
| `test_square_route.html` | Testovací app – ORS routing + Mapy.cz tiles + 5 tvarů | ✅ |
| `start_server.bat` | Spustí lokální HTTP server pro geolokaci | ✅ |
| `context.md` | Dokumentace projektu | ✅ |
| `.gitignore` | Vylučuje `.env` a další | ✅ |
| `.env` | API klíče | ❌ nikdy |

---

## Fázování

| Fáze | Stav | Obsah |
|---|---|---|
| **Test (HTML)** | ✅ Hotovo | `test_square_route.html` – ověření celého pipeline v prohlížeči |
| **MVP (React Native)** | 🔜 Další krok | GPS, 5 tvarů, km slider, ORS routing, Mapy.cz tiles |
| **Fáze 2** | 📋 Plán | Spirála, S-křivka (otevřené tvary) |
| **Fáze 3** | 📋 Plán | Export GPX, sdílení trasy, offline dlaždice |

---

## Zdroje

- Mapy.cz Developer Portal: https://developer.mapy.com/
- Mapy.cz tiles docs: https://api.mapy.cz/v1/docs/maptiles/
- ORS API docs: https://openrouteservice.org/dev/#/api-docs
- MapLibre GL JS: https://maplibre.org/maplibre-gl-js/docs/
- Licence Mapy.cz: https://licence.mapy.com/
