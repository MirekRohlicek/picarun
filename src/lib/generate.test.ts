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
