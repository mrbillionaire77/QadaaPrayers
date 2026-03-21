import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight } from '@/constants/theme';

interface AppHeaderProps {
  onReset?: () => void;
}

const getArabicDate = (): string => {
  return new Date().toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const AppHeader = memo(({ onReset }: AppHeaderProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Pressable
          style={({ pressed }) => [styles.resetBtn, pressed && styles.pressed]}
          onPress={onReset}
          hitSlop={8}
        >
          <MaterialIcons name="refresh" size={22} color={Colors.gold} />
        </Pressable>

        <View style={styles.center}>
          <Image
            source={require('@/assets/mosque-icon.png')}
            style={styles.icon}
            contentFit="contain"
            transition={200}
          />
          <Text style={styles.title}>قضاء الصلوات</Text>
          <Text style={styles.date}>{getArabicDate()}</Text>
        </View>

        {/* Spacer for balance */}
        <View style={styles.spacer} />
      </View>
    </View>
  );
});

AppHeader.displayName = 'AppHeader';
export default AppHeader;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  topRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: {
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    width: 64,
    height: 64,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extraBold,
    color: Colors.card,
    textAlign: 'center',
  },
  date: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: Spacing.xs,
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
  spacer: {
    width: 40,
  },
  pressed: {
    opacity: 0.7,
  },
});
