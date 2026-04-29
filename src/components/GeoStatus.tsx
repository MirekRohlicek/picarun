import { useAppStore } from '../store/useAppStore';

export function GeoStatus() {
  const { gpsStatus, gpsMessage } = useAppStore();

  const colors: Record<typeof gpsStatus, string> = {
    idle:    'text-secondary',
    loading: 'text-secondary animate-pulse',
    ok:      'text-green-400',
    error:   'text-red-400',
  };

  const icons: Record<typeof gpsStatus, string> = {
    idle:    '◎',
    loading: '◌',
    ok:      '●',
    error:   '✕',
  };

  return (
    <div className={`text-[10px] flex items-center gap-1.5 ${colors[gpsStatus]}`}>
      <span>{icons[gpsStatus]}</span>
      <span>{gpsMessage || 'Poloha'}</span>
    </div>
  );
}
