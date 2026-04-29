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
