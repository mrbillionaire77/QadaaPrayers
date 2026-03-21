export const STORAGE_KEY = 'prayer_tracker_data_v1';

export const PRAYERS = [
  { id: 'fajr', name: 'الفجر', arabicName: 'الفجر', time: 'قبل الشروق', rakaat: 2 },
  { id: 'dhuhr', name: 'الظهر', arabicName: 'الظهر', time: 'منتصف النهار', rakaat: 4 },
  { id: 'asr', name: 'العصر', arabicName: 'العصر', time: 'بعد الظهر', rakaat: 4 },
  { id: 'maghrib', name: 'المغرب', arabicName: 'المغرب', time: 'عند الغروب', rakaat: 3 },
  { id: 'isha', name: 'العشاء', arabicName: 'العشاء', time: 'بعد العشاء', rakaat: 4 },
] as const;

export type PrayerId = typeof PRAYERS[number]['id'];

export const NOTIFICATION_ID = 1001;
export const QURAN_VERSE = '﴿ وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ ﴾';
export const APP_NAME = 'تطبيق قضاء الصلوات';
