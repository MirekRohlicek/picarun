# Pica Run – Web App Design Spec

**Datum:** 2026-04-29  
**Stav:** Schváleno  
**Verze:** MVP + V2 plán

---

## 1. Co stavíme

Responzivní webová aplikace pro generování pěších/běžeckých tras ve vizuálně zajímavých tvarech. Uživatel vybere tvar, zadá délku v km a aplikace vygeneruje reálnou trasu po skutečných cestách přes ORS API. Mapa podložena Mapy.cz dlaždicemi.

**Není** mobilní app, **není** PWA (v MVP). To přijde v V2.

---

## 2. Tech stack

| Oblast | Technologie | Důvod |
|---|---|---|
| Framework | **React 18 + Vite + TypeScript** | Komponenty, škálovatelnost, TS odchytí chyby |
| Styling | **Tailwind CSS** | Rychlý responsivní layout, utility-first |
| Mapa | **MapLibre GL JS** | Open-source, podporuje Mapy.cz raster tiles |
| Routing | **OpenRouteService API** | 50 waypointů/req, foot-walking profil |
| Map tiles | **Mapy.cz** | Nejlepší vizuální kvalita pro ČR |
| State | **Zustand** | Minimální boilerplate, jednoduché |
| HTTP | **fetch** (nativní) | Žádná extra závislost |

---

## 3. Design systém

### Barvy (z PicaRun Design System PDF)

```
--color-accent:     #FF6A4A   /* korálová – CTA, aktivní prvky */
--color-bg:         #0F1226   /* tmavá navy – hlavní pozadí */
--color-panel:      #2E3251   /* tmavší navy – karty, panely */
--color-secondary:  #5A5F7E   /* šedofialová – sekundární text, popisky */
--color-cream:      #FCF8F4   /* teplá krémová – primární text na tmavém */
```

### Typografie
Font bude doplněn v další iteraci. Placeholder: `system-ui`.

### Principy UI
- Tmavý režim jako základ (není přepínač v MVP)
- Accent `#FF6A4A` jen na primární akci (tlačítko Generovat, aktivní tvar, výsledná délka)
- Maximální jednoduchost – žádné zbytečné informace

---

## 4. Tvary (MVP)

Pořadí a implementace:

| # | Tvar | Waypointů | Detour koef. |
|---|---|---|---|
| 1 | **Kosočtverec** | 9 (4 rohy + 4 středy stran + uzavření) | 1.18 |
| 2 | Kruh | 25 (24 × 15° + uzavření) | 1.18 |
| 3 | Čtverec | 9 (4 rohy + 4 středy stran + uzavření) | 1.18 |
| 4 | Trojúhelník | 7 (3 rohy + 3 středy stran + uzavření) | 1.18 |
| 5 | Pětiúhelník | 11 (5 rohů + 5 středů stran + uzavření) | 1.18 |

Kosočtverec = čtverec s pevnou rotací 45°. Tlačítko **Otočit** přidává 45° ke stávající rotaci při každém kliknutí.

---

## 5. Funkcionalita MVP

### 5.1 GPS geolokace
- Spustí se automaticky při načtení stránky (`navigator.geolocation.getCurrentPosition`)
- `enableHighAccuracy: false`, `timeout: 15000` – rychlé WiFi/síť určení
- Fallback: Praha (50.0755, 14.4378) pokud geolokace selže nebo je zamítnuta
- Uživatel může přepsat souřadnice ručně (skryté pole, zobrazí se při chybě GPS)

### 5.2 Výběr tvaru
- 5 ikon v řadě, kliknutím se přepíná
- Výchozí: Kosočtverec
- Aktivní tvar zvýrazněn barvou `#FF6A4A`

### 5.3 Délka trasy
- Numerický input v km (min 0.5, max 100, krok 0.5)
- Výchozí: 5 km

### 5.4 Rotace
- Tlačítko **Otočit** – každým kliknutím přidá 45°
- Stav: 0° / 45° / 90° / 135° / 180° / 225° / 270° / 315° → pak zpět na 0°
- Zobrazuje aktuální úhel vedle tlačítka (např. „45°")

### 5.5 Generování trasy
1. `ShapeGenerator` vypočítá waypointy matematicky (bez API)
2. `RouteClient` zavolá ORS API (max 3 iterace kalibrace)
3. Výsledek se vykreslí na mapě

### 5.6 Iterativní kalibrace km
```
iterace 1: vygeneruj trasu s DETOUR=1.18
           → ORS vrátí reálnou délku
           → pokud odchylka > 5 %: uprav poloměr a opakuj
iterace 2: max 1 korekce (nový poloměr = target/realKm × starýPoloměr)
iterace 3: přijmi výsledek, zobraz reálnou délku
```
Max 3 ORS volání na jedno generování.

### 5.7 Zobrazení výsledku
- **Jen délka trasy** v km (velké číslo, accent barva)
- Na mapě: pill dole uprostřed se vzdáleností
- Na panelu: karta s velkým číslem

### 5.8 Mapa
- MapLibre GL JS s Mapy.cz outdoor tiles
- Mapa se přiblíží na vygenerovanou trasu (`fitBounds`)
- Trasa: `#FF6A4A` linie, 5px, s tmavou obrysovou linií pod ní
- Start/cíl: korálová tečka se bílým ohraničením

---

## 6. Layout a responsivita

### Mobil (< 768px) – dva stavy
**Stav A – Nastavení:**
- Full screen panel: tvar, GPS, km, Otočit, Generovat, výsledek

**Stav B – Mapa:**
- Full screen mapa po kliknutí Generovat
- Pill s km dole uprostřed
- Tlačítko ← Zpět vlevo nahoře

Přechod: Generovat → zobraz mapu. Zpět → zobraz nastavení.

### Desktop (≥ 768px) – jeden stav
- Panel 280px vlevo (fixed), mapa zbytek vpravo
- Vždy obojí viditelné
- Generovat aktualizuje mapu vpravo bez přepínání

---

## 7. Struktura projektu

```
src/
  components/
    ShapePicker.tsx       – výběr tvaru (5 ikon)
    KmInput.tsx           – input pro délku + tlačítko Otočit
    GenerateButton.tsx    – hlavní CTA
    RouteResult.tsx       – zobrazení délky
    MapView.tsx           – MapLibre mapa s trasou
    GeoStatus.tsx         – stav GPS
  lib/
    shapes.ts             – generátory waypointů pro každý tvar
    ors.ts                – ORS API volání + iterativní kalibrace
    geo.ts                – geodesicOffset a pomocné funkce
  store/
    useAppStore.ts        – Zustand store (tvar, km, rotace, trasa, GPS)
  App.tsx                 – root, responsivní layout (mobil/desktop)
  main.tsx
```

---

## 8. Klíčové API

### ORS Routing
```
POST https://api.openrouteservice.org/v2/directions/foot-walking/geojson
Authorization: ORS_API_KEY
Content-Type: application/json

{ "coordinates": [[lon, lat], ...] }

Response: features[0].properties.summary.distance (metry)
          features[0].geometry.coordinates (trasa)
```

### Mapy.cz Tiles
```
https://api.mapy.cz/v1/maptiles/outdoor/256/{z}/{x}/{y}?apikey=MAPY_KEY
```

### API klíče
Uloženy v `.env` souboru, nikdy v kódu:
```
VITE_ORS_API_KEY=...
VITE_MAPY_CZ_API_KEY=...
```

---

## 9. Co není v MVP (přijde v V2)

- PWA / instalovatelnost
- Historie tras (localStorage)
- Export GPX
- Sdílení trasy přes URL
- Více tvarů (srdce, spirála)
- Světlý režim
- Vlastní font z design systému

---

## 10. Definice hotovo (MVP)

- [ ] GPS načte polohu automaticky při otevření
- [ ] Kosočtverec je výchozí tvar
- [ ] Generovat vytvoří trasu a zobrazí ji na mapě
- [ ] Kalibrace zajistí ≤ 5% odchylku (max 3 ORS volání)
- [ ] Zobrazuje se jen délka trasy v km
- [ ] Tlačítko Otočit mění rotaci po 45°
- [ ] Responzivní: mobil (2 stavy) + desktop (panel+mapa)
- [ ] API klíče v `.env`, nejsou v kódu
- [ ] Nasaditelné staticky (Vercel / Netlify / GitHub Pages)
