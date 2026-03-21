// Islamic Color Palette & Design Tokens
export const Colors = {
  primary: '#1F4A3A',       // Deep Green
  primaryDark: '#163529',   // Darker Green
  gold: '#C5A028',          // Islamic Gold
  goldLight: '#D4B84A',     // Lighter Gold
  beige: '#F5F0E6',         // Background Beige
  card: '#FFFFFF',          // Card White
  cardAlt: '#FAFAF7',       // Alternate card
  text: '#1A2E23',          // Dark text
  textSecondary: '#5A6B62', // Secondary text
  textMuted: '#9AA89F',     // Muted text
  border: '#E8E2D4',        // Border
  success: '#2D6A4F',       // Success green
  danger: '#B5433A',        // Danger red
  shadow: 'rgba(31, 74, 58, 0.12)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
};

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 48,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
};
