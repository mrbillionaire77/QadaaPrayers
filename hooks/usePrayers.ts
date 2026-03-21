import { useContext } from 'react';
import { PrayerContext } from '@/contexts/PrayerContext';

export function usePrayers() {
  const context = useContext(PrayerContext);
  if (!context) throw new Error('usePrayers must be used within PrayerProvider');
  return context;
}
