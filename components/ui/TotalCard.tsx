import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';

interface TotalCardProps {
  total: number;
}

const TotalCard = memo(({ total }: TotalCardProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.totalNumber}>{total.toLocaleString('ar-SA')}</Text>
      <Text style={styles.totalLabel}>صلاة متبقية إجمالاً</Text>
    </View>
  );
});

TotalCard.displayName = 'TotalCard';
export default TotalCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  totalNumber: {
    fontSize: 56,
    fontWeight: FontWeight.extraBold,
    color: Colors.gold,
    textAlign: 'center',
    includeFontPadding: false,
  },
  totalLabel: {
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.8)',
    marginTop: Spacing.xs,
    textAlign: 'center',
    fontWeight: FontWeight.medium,
  },
});
