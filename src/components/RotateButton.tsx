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
