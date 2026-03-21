import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { PrayerData, loadPrayerData, savePrayerData, updatePrayerCount, resetAllPrayers } from '@/services/prayerStorage';
import { PrayerId, PRAYERS } from '@/constants/config';
import { scheduleReminderNotification, setupNotificationHandler } from '@/services/notificationService';

interface PrayerContextType {
  prayerData: PrayerData | null;
  isLoading: boolean;
  totalCount: number;
  increment: (id: PrayerId) => void;
  decrement: (id: PrayerId) => void;
  resetAll: () => void;
  setCount: (id: PrayerId, value: number) => void;
}

export const PrayerContext = createContext<PrayerContextType | undefined>(undefined);

export function PrayerProvider({ children }: { children: ReactNode }) {
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setupNotificationHandler();
    (async () => {
      const data = await loadPrayerData();
      setPrayerData(data);
      setIsLoading(false);
      scheduleReminderNotification();
    })();
  }, []);

  const totalCount = prayerData
    ? Object.values(prayerData.prayers).reduce((sum, v) => sum + v, 0)
    : 0;

  const increment = useCallback(async (id: PrayerId) => {
    const updated = await updatePrayerCount(id, 1);
    if (updated) setPrayerData(updated);
  }, []);

  const decrement = useCallback(async (id: PrayerId) => {
    if (!prayerData) return;
    if ((prayerData.prayers[id] ?? 0) <= 0) return;
    const updated = await updatePrayerCount(id, -1);
    if (updated) setPrayerData(updated);
  }, [prayerData]);

  const resetAll = useCallback(async () => {
    const fresh = await resetAllPrayers();
    setPrayerData(fresh);
  }, []);

  const setCount = useCallback(async (id: PrayerId, value: number) => {
    if (!prayerData) return;
    const clamped = Math.max(0, value);
    const updated: PrayerData = {
      ...prayerData,
      prayers: { ...prayerData.prayers, [id]: clamped },
    };
    await savePrayerData(updated);
    setPrayerData(updated);
  }, [prayerData]);

  return (
    <PrayerContext.Provider value={{ prayerData, isLoading, totalCount, increment, decrement, resetAll, setCount }}>
      {children}
    </PrayerContext.Provider>
  );
}
