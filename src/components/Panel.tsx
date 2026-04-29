import { ShapePicker } from './ShapePicker';
import { KmInput } from './KmInput';
import { RotateButton } from './RotateButton';
import { GenerateButton } from './GenerateButton';
import { RouteResult } from './RouteResult';
import { GeoStatus } from './GeoStatus';

export function Panel() {
  return (
    <div className="flex flex-col h-full overflow-y-auto bg-bg border-r border-panel">
      {/* Hlavička */}
      <div className="px-4 py-4 border-b border-panel shrink-0">
        <h1 className="text-lg font-black tracking-[0.2em] text-cream">
          PICA<span className="text-accent">RUN</span>
        </h1>
      </div>

      <div className="flex flex-col gap-5 px-4 py-4 flex-1">
        {/* Tvar */}
        <div className="flex flex-col gap-2">
          <p className="text-[9px] uppercase tracking-widest text-secondary">Tvar trasy</p>
          <ShapePicker />
        </div>

        {/* GPS */}
        <div className="flex flex-col gap-1">
          <p className="text-[9px] uppercase tracking-widest text-secondary">Výchozí bod</p>
          <div className="bg-panel rounded-lg px-3 py-2">
            <GeoStatus />
          </div>
        </div>

        {/* Délka + Rotace */}
        <div className="flex flex-col gap-2">
          <p className="text-[9px] uppercase tracking-widest text-secondary">Parametry</p>
          <div className="flex gap-2">
            <div className="flex-1">
              <KmInput />
            </div>
            <div className="flex items-end">
              <RotateButton />
            </div>
          </div>
        </div>

        {/* Generovat */}
        <GenerateButton />

        {/* Výsledek */}
        <RouteResult />
      </div>
    </div>
  );
}
