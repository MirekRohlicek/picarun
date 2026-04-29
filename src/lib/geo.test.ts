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

  it('bearing > 360 se zpracuje správně (periodická funkce)', () => {
    const [lon1, lat1] = geodesicOffset(50.0, 14.0, 1000, 45);
    const [lon2, lat2] = geodesicOffset(50.0, 14.0, 1000, 45 + 360);
    expect(lat1).toBeCloseTo(lat2, 8);
    expect(lon1).toBeCloseTo(lon2, 8);
  });

  it('záporný bearing se zpracuje správně', () => {
    const [lon1, lat1] = geodesicOffset(50.0, 14.0, 1000, -90);
    const [lon2, lat2] = geodesicOffset(50.0, 14.0, 1000, 270);
    expect(lat1).toBeCloseTo(lat2, 8);
    expect(lon1).toBeCloseTo(lon2, 8);
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
