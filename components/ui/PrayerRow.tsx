import React, { memo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { PrayerId } from '@/constants/config';

interface PrayerRowProps {
  id: PrayerId;
  name: string;
  time: string;
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onSetCount: (value: number) => void;
  isLast?: boolean;
}

const PrayerRow = memo(({
  id,
  name,
  time,
  count,
  onIncrement,
  onDecrement,
  onSetCount,
  isLast = false,
}: PrayerRowProps) => {
  const [editVisible, setEditVisible] = useState(false);
  const [editValue, setEditValue] = useState('');

  const openEdit = () => {
    setEditValue(count.toString());
    setEditVisible(true);
  };

  const confirmEdit = () => {
    const num = parseInt(editValue, 10);
    if (!isNaN(num) && num >= 0) {
      onSetCount(num);
    }
    setEditVisible(false);
  };

  return (
    <>
      <View style={[styles.row, isLast && styles.rowLast]}>
        {/* Prayer Name - Right */}
        <View style={styles.nameSection}>
          <Text style={styles.prayerName}>{name}</Text>
          <Text style={styles.prayerTime}>{time}</Text>
        </View>

        {/* Counter Controls - Left */}
        <View style={styles.counterSection}>
          <Pressable
            style={({ pressed }) => [styles.controlBtn, styles.decrementBtn, pressed && styles.pressed]}
            onPress={onDecrement}
            hitSlop={8}
          >
            <Text style={styles.controlBtnText}>−</Text>
          </Pressable>

          <Pressable onPress={openEdit} style={styles.countWrapper}>
            <Text style={styles.countText}>{count.toLocaleString('ar-SA')}</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.controlBtn, styles.incrementBtn, pressed && styles.pressed]}
            onPress={onIncrement}
            hitSlop={8}
          >
            <Text style={styles.controlBtnText}>+</Text>
          </Pressable>
        </View>
      </View>

      {/* Edit Modal */}
      <Modal visible={editVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setEditVisible(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>تعديل عدد {name}</Text>
              <TextInput
                style={styles.modalInput}
                value={editValue}
                onChangeText={setEditValue}
                keyboardType="number-pad"
                autoFocus
                textAlign="center"
              />
              <View style={styles.modalButtons}>
                <Pressable style={styles.modalCancelBtn} onPress={() => setEditVisible(false)}>
                  <Text style={styles.modalCancelText}>إلغاء</Text>
                </Pressable>
                <Pressable style={styles.modalConfirmBtn} onPress={confirmEdit}>
                  <Text style={styles.modalConfirmText}>تأكيد</Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </>
  );
});

PrayerRow.displayName = 'PrayerRow';
export default PrayerRow;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  nameSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  prayerName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    textAlign: 'right',
  },
  prayerTime: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'right',
  },
  counterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  controlBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incrementBtn: {
    backgroundColor: Colors.primary,
  },
  decrementBtn: {
    backgroundColor: Colors.border,
  },
  controlBtnText: {
    fontSize: 20,
    fontWeight: FontWeight.bold,
    color: Colors.card,
    lineHeight: 22,
    includeFontPadding: false,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  countWrapper: {
    minWidth: 60,
    alignItems: 'center',
  },
  countText: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extraBold,
    color: Colors.text,
    textAlign: 'center',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    width: 280,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  modalInput: {
    width: '100%',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.border,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: FontWeight.semiBold,
  },
  modalConfirmBtn: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: FontSize.md,
    color: Colors.card,
    fontWeight: FontWeight.bold,
  },
});
