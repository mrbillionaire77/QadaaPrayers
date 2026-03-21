import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEY, PrayerId } from '@/constants/config';

export interface PrayerData {
  version: number;
  lastUpdated: string;
  lastInteractionDate: string;
  prayers: Record<PrayerId, number>;
}

const DEFAULT_DATA: PrayerData = {
  version: 1,
  lastUpdated: new Date().toISOString(),
  lastInteractionDate: '',
  prayers: {
    fajr: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
  },
};

export async function loadPrayerData(): Promise<PrayerData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_DATA };
    const parsed = JSON.parse(raw) as PrayerData;
    // Ensure all prayer keys exist
    const prayers = { ...DEFAULT_DATA.prayers, ...parsed.prayers };
    return { ...DEFAULT_DATA, ...parsed, prayers };
  } catch {
    return { ...DEFAULT_DATA };
  }
}

export async function savePrayerData(data: PrayerData): Promise<void> {
  try {
    const toSave: PrayerData = {
      ...data,
      lastUpdated: new Date().toISOString(),
      lastInteractionDate: new Date().toISOString().split('T')[0],
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // silent fail
  }
}

export async function updatePrayerCount(
  prayerId: PrayerId,
  delta: number
): Promise<PrayerData | null> {
  const data = await loadPrayerData();
  const current = data.prayers[prayerId] ?? 0;
  const newValue = current + delta;
  if (newValue < 0) return null; // prevent negative
  const updated: PrayerData = {
    ...data,
    prayers: { ...data.prayers, [prayerId]: newValue },
  };
  await savePrayerData(updated);
  return updated;
}

export async function resetAllPrayers(): Promise<PrayerData> {
  const fresh: PrayerData = {
    ...DEFAULT_DATA,
    lastUpdated: new Date().toISOString(),
    lastInteractionDate: new Date().toISOString().split('T')[0],
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  return fresh;
}
