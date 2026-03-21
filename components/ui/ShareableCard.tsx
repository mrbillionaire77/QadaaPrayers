import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { PRAYERS, QURAN_VERSE, APP_NAME } from '@/constants/config';
import { PrayerData } from '@/services/prayerStorage';

interface ShareableCardProps {
  prayerData: PrayerData;
  totalCount: number;
}

const ShareableCard = forwardRef<View, ShareableCardProps>(({ prayerData, totalCount }, ref) => {
  const dateStr = new Date().toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View ref={ref} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.mosque}>🕌</Text>
        <Text style={styles.title}>قضاء الصلوات</Text>
        <Text style={styles.date}>{dateStr}</Text>
      </View>

      {/* Total */}
      <View style={styles.totalCard}>
        <Text style={styles.totalNumber}>{totalCount.toLocaleString('ar-SA')}</Text>
        <Text style={styles.totalLabel}>صلاة متبقية إجمالاً</Text>
      </View>

      {/* Prayer List */}
      <View style={styles.prayerList}>
        {PRAYERS.map((prayer, index) => (
          <View
            key={prayer.id}
            style={[styles.prayerRow, index < PRAYERS.length - 1 && styles.prayerRowBorder]}
          >
            <Text style={styles.prayerCount}>
              {(prayerData.prayers[prayer.id] ?? 0).toLocaleString('ar-SA')}
            </Text>
            <Text style={styles.prayerTime}>{prayer.time}</Text>
            <Text style={styles.prayerName}>{prayer.name}</Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.verse}>{QURAN_VERSE}</Text>
        <Text style={styles.appName}>{APP_NAME}</Text>
      </View>
    </View>
  );
});

ShareableCard.displayName = 'ShareableCard';
export default ShareableCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.beige,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    padding: Spacing.lg,
    width: 340,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  mosque: {
    fontSize: 40,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extraBold,
    color: Colors.primary,
    textAlign: 'center',
  },
  date: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  totalCard: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  totalNumber: {
    fontSize: 44,
    fontWeight: FontWeight.extraBold,
    color: Colors.gold,
    textAlign: 'center',
  },
  totalLabel: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    textAlign: 'center',
  },
  prayerList: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  prayerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  prayerRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  prayerName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    flex: 1,
    textAlign: 'right',
  },
  prayerTime: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    flex: 1,
  },
  prayerCount: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extraBold,
    color: Colors.text,
    flex: 1,
    textAlign: 'left',
  },
  footer: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
  },
  verse: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  appName: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
