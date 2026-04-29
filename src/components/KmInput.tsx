import { useAppStore } from '../store/useAppStore';

export function KmInput() {
  const { km, setKm } = useAppStore();

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] uppercase tracking-widest text-secondary">
        Délka trasy
      </label>
      <div className="flex items-center gap-2 bg-panel border border-panel rounded-lg px-3 py-2">
        <input
          type="number"
          min={0.5}
          max={100}
          step={0.5}
          value={km}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v) && v >= 0.5 && v <= 100) setKm(v);
          }}
          className="flex-1 bg-transparent text-cream text-sm font-semibold outline-none w-0"
        />
        <span className="text-secondary text-xs shrink-0">km</span>
      </div>
    </div>
  );
}
