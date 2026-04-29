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
    expect(base[0]).not.toEqual(rotated[0]);
  });

  it('SHAPE_IDS obsahuje 5 tvarů', () => {
    expect(SHAPE_IDS).toHaveLength(5);
  });
});
