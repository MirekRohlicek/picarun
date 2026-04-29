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
