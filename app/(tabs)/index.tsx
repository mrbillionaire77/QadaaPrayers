import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Modal,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { PRAYERS, QURAN_VERSE, APP_NAME } from '@/constants/config';
import { usePrayers } from '@/hooks/usePrayers';
import { useAlert } from '@/template';
import { PrayerRow, TotalCard, ShareableCard } from '@/components';
import { PrayerId } from '@/constants/config';

const getArabicDate = (): string => {
  return new Date().toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function HomeScreen() {
  const { prayerData, isLoading, totalCount, increment, decrement, resetAll, setCount } = usePrayers();
  const { showAlert } = useAlert();
  const [sharing, setSharing] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);

  const handleReset = () => {
    showAlert(
      'إعادة تعيين',
      'هل تريد إعادة تعيين جميع الصلوات إلى الصفر؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'إعادة تعيين',
          style: 'destructive',
          onPress: () => resetAll(),
        },
      ]
    );
  };

  const handleShare = async () => {
    if (!prayerData) return;
    try {
      setSharing(true);
      const dateStr = new Date().toLocaleDateString('ar-SA', {
        year: 'numeric', month: 'long', day: 'numeric',
      });
      const prayerLines = PRAYERS.map(
        (p) => `${p.name}: ${prayerData.prayers[p.id as PrayerId] ?? 0} صلاة`
      ).join('\n');
      const message = [
        `🕌 قضاء الصلوات — ${dateStr}`,
        ``,
        `إجمالي الصلوات المتبقية: ${totalCount}`,
        ``,
        prayerLines,
        ``,
        QURAN_VERSE,
        APP_NAME,
      ].join('\n');
      await Share.share({ message, title: 'تقرير الصلوات الفائتة' });
    } catch {
      // user cancelled or error
    } finally {
      setSharing(false);
    }
  };

  const handleShowShareCard = () => {
    setShareModalVisible(true);
  };

  if (isLoading || !prayerData) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>جارٍ التحميل...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Pressable
            style={({ pressed }) => [styles.resetBtn, pressed && styles.pressed]}
            onPress={handleReset}
            hitSlop={8}
          >
            <MaterialIcons name="refresh" size={22} color={Colors.gold} />
          </Pressable>

          <View style={styles.headerCenter}>
            <View style={styles.mosqueIcon}>
              <Text style={styles.mosqueEmoji}>🕌</Text>
            </View>
            <Text style={styles.headerTitle}>قضاء الصلوات</Text>
            <Text style={styles.headerDate}>{getArabicDate()}</Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Total Count Card */}
        <TotalCard total={totalCount} />

        {/* Prayer Rows Card */}
        <View style={styles.prayerCard}>
          {PRAYERS.map((prayer, index) => (
            <PrayerRow
              key={prayer.id}
              id={prayer.id as PrayerId}
              name={prayer.name}
              time={prayer.time}
              count={prayerData.prayers[prayer.id as PrayerId] ?? 0}
              onIncrement={() => increment(prayer.id as PrayerId)}
              onDecrement={() => decrement(prayer.id as PrayerId)}
              onSetCount={(v) => setCount(prayer.id as PrayerId, v)}
              isLast={index === PRAYERS.length - 1}
            />
          ))}
        </View>

        {/* Quran Verse */}
        <View style={styles.verseContainer}>
          <Text style={styles.verseText}>{QURAN_VERSE}</Text>
          <Text style={styles.appTag}>تطبيق قضاء الصلوات</Text>
        </View>

        {/* Info tip */}
        <View style={styles.tipContainer}>
          <MaterialIcons name="touch-app" size={16} color={Colors.textMuted} />
          <Text style={styles.tipText}>اضغط على الرقم لتعديله مباشرة</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Share FAB */}
      <Pressable
        style={({ pressed }) => [styles.shareBtn, pressed && styles.shareBtnPressed]}
        onPress={handleShowShareCard}
        disabled={sharing}
      >
        {sharing ? (
          <ActivityIndicator size="small" color={Colors.card} />
        ) : (
          <>
            <MaterialIcons name="share" size={22} color={Colors.card} />
            <Text style={styles.shareBtnText}>مشاركة التقرير</Text>
          </>
        )}
      </Pressable>

      {/* Share Preview Modal */}
      <Modal
        visible={shareModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setShareModalVisible(false)}
      >
        <View style={styles.shareModalOverlay}>
          <View style={styles.shareModalContainer}>
            <View style={styles.shareModalHeader}>
              <Pressable
                style={({ pressed }) => [styles.shareModalCloseBtn, pressed && styles.pressed]}
                onPress={() => setShareModalVisible(false)}
              >
                <MaterialIcons name="close" size={22} color={Colors.textSecondary} />
              </Pressable>
              <Text style={styles.shareModalTitle}>معاينة التقرير</Text>
              <Pressable
                style={({ pressed }) => [styles.shareModalShareBtn, pressed && styles.pressed]}
                onPress={() => { setShareModalVisible(false); handleShare(); }}
              >
                <MaterialIcons name="share" size={22} color={Colors.gold} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', padding: Spacing.md }}>
              {prayerData ? <ShareableCard prayerData={prayerData} totalCount={totalCount} /> : null}
              <Text style={styles.shareHint}>اضغط على أيقونة المشاركة لمشاركة التقرير</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.beige,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  // Header
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  headerTopRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  mosqueIcon: {
    width: 64,
    height: 64,
    marginBottom: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mosqueEmoji: {
    fontSize: 48,
    lineHeight: 60,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extraBold,
    color: Colors.card,
    textAlign: 'center',
  },
  headerDate: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    textAlign: 'center',
  },
  resetBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(197,160,40,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  // Content
  scrollView: {
    flex: 1,
    backgroundColor: Colors.beige,
  },
  scrollContent: {
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  prayerCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  verseContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
    elevation: 1,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  verseText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    textAlign: 'center',
    lineHeight: 28,
  },
  appTag: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  tipContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  tipText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  // Share button
  shareBtn: {
    position: 'absolute',
    bottom: Platform.select({ ios: 32, default: 24 }),
    left: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: Colors.gold,
    borderRadius: Radius.full,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    elevation: 6,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  shareBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  shareBtnText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.card,
  },
  // Share Modal
  shareModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  shareModalContainer: {
    backgroundColor: Colors.beige,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    maxHeight: '90%',
    minHeight: '50%',
  },
  shareModalHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  shareModalTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    flex: 1,
    textAlign: 'center',
  },
  shareModalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareModalShareBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(197,160,40,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareHint: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  pressed: {
    opacity: 0.7,
  },
});
