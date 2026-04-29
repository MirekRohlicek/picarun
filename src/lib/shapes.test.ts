import { describe, it, expect } from 'vitest';
import { generateWaypoints, SHAPE_IDS } from './shapes';

const C = { lat: 50.0755, lon: 14.4378 };
const KM = 5;

describe('generateWaypoints', () => {
  describe('pica', () => {
    it('vrátí 9 waypointů', () => {
      expect(generateWaypoints('pica', C.lat, C.lon, KM, 0)).toHaveLength(9);
    });
    it('je uzavřený (první = poslední)', () => {
      const wps = generateWaypoints('pica', C.lat, C.lon, KM, 0);
      expect(wps[0]).toEqual(wps[wps.length - 1]);
    });
    it('všechny body jsou blízko středu (< 0.2°)', () => {
      const wps = generateWaypoints('pica', C.lat, C.lon, KM, 0);
      wps.forEach(([lon, lat]) => {
        expect(Math.abs(lat - C.lat)).toBeLessThan(0.2);
        expect(Math.abs(lon - C.lon)).toBeLessThan(0.2);
      });
    });
  });

  describe('penis', () => {
    it('vrátí 10 waypointů', () => {
      expect(generateWaypoints('penis', C.lat, C.lon, KM, 0)).toHaveLength(10);
    });
    it('je uzavřený (první = poslední)', () => {
      const wps = generateWaypoints('penis', C.lat, C.lon, KM, 0);
      expect(wps[0]).toEqual(wps[wps.length - 1]);
    });
    it('všechny body jsou blízko středu (< 0.2°)', () => {
      const wps = generateWaypoints('penis', C.lat, C.lon, KM, 0);
      wps.forEach(([lon, lat]) => {
        expect(Math.abs(lat - C.lat)).toBeLessThan(0.2);
        expect(Math.abs(lon - C.lon)).toBeLessThan(0.2);
      });
    });
  });

  describe('heart', () => {
    it('vrátí 17 waypointů', () => {
      expect(generateWaypoints('heart', C.lat, C.lon, KM, 0)).toHaveLength(17);
    });
    it('je uzavřený (první = poslední)', () => {
      const wps = generateWaypoints('heart', C.lat, C.lon, KM, 0);
      expect(wps[0]).toEqual(wps[wps.length - 1]);
    });
    it('všechny body jsou blízko středu (< 0.2°)', () => {
      const wps = generateWaypoints('heart', C.lat, C.lon, KM, 0);
      wps.forEach(([lon, lat]) => {
        expect(Math.abs(lat - C.lat)).toBeLessThan(0.2);
        expect(Math.abs(lon - C.lon)).toBeLessThan(0.2);
      });
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

  it('rotace posune waypointy', () => {
    const base    = generateWaypoints('pica', C.lat, C.lon, KM, 0);
    const rotated = generateWaypoints('pica', C.lat, C.lon, KM, 45);
    expect(base[0]).not.toEqual(rotated[0]);
  });

  it('SHAPE_IDS obsahuje 5 tvarů', () => {
    expect(SHAPE_IDS).toHaveLength(5);
  });

  it('pořadí tvarů: pica, penis, heart, square, triangle', () => {
    expect(SHAPE_IDS[0]).toBe('pica');
    expect(SHAPE_IDS[1]).toBe('penis');
    expect(SHAPE_IDS[2]).toBe('heart');
    expect(SHAPE_IDS[3]).toBe('square');
    expect(SHAPE_IDS[4]).toBe('triangle');
  });
});
