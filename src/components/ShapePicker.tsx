import type { ReactNode } from 'react';
import { SHAPE_IDS, SHAPE_LABELS, type ShapeId } from '../lib/shapes';
import { useAppStore } from '../store/useAppStore';

const SHAPE_ICONS: Record<ShapeId, ReactNode> = {
  diamond:  <polygon points="12,2 22,12 12,22 2,12" />,
  circle:   <circle cx="12" cy="12" r="10" />,
  square:   <rect x="2" y="2" width="20" height="20" />,
  triangle: <polygon points="12,2 22,21 2,21" />,
  pentagon: <polygon points="12,2 22,9 18,21 6,21 2,9" />,
};

export function ShapePicker() {
  const { shape, setShape } = useAppStore();

  return (
    <div className="flex gap-2">
      {SHAPE_IDS.map((id) => (
        <button
          key={id}
          onClick={() => setShape(id)}
          className={[
            'flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg border text-xs transition-colors',
            id === shape
              ? 'border-accent text-accent bg-accent/10'
              : 'border-panel text-secondary bg-panel hover:border-secondary',
          ].join(' ')}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="w-5 h-5"
          >
            {SHAPE_ICONS[id]}
          </svg>
          {SHAPE_LABELS[id]}
        </button>
      ))}
    </div>
  );
}
