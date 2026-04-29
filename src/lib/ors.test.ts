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
