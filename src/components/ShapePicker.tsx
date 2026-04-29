import type { ReactNode } from 'react';
import { SHAPE_IDS, SHAPE_LABELS, type ShapeId } from '../lib/shapes';
import { useAppStore } from '../store/useAppStore';

const SHAPE_ICONS: Record<ShapeId, ReactNode> = {
  pica: <polygon points="12,2 22,12 12,22 2,12" />,

  penis: (
    <path d="
      M10,22 L10,12
      A5,5 0 1,1 14,12
      L14,22 Q14,23 12,23 Q10,23 10,22 Z
    " />
  ),

  heart: (
    <path d="
      M12,20
      C6,15 2,11 2,7.5
      A4.5,4.5 0 0,1 9.5,4
      C10.5,4 11.5,4.5 12,5
      C12.5,4.5 13.5,4 14.5,4
      A4.5,4.5 0 0,1 22,7.5
      C22,11 18,15 12,20 Z
    " />
  ),

  square:   <rect x="2" y="2" width="20" height="20" />,
  triangle: <polygon points="12,2 22,21 2,21" />,
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
