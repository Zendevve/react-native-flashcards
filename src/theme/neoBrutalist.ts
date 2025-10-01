// Neo-Brutalism Design System for FlashCards Pro
// Inspired by bold, unapologetic UI with thick borders, hard shadows, and vibrant accents

import type { TextStyle, ViewStyle } from 'react-native';

export const NeoBrutalistColors = {
  // Base colors
  background: '#FAFAFA',
  foreground: '#0A0A0A',
  accent: '#A78BFA',
  accentDark: '#7C3AED',
  accentLight: '#C4B5FD',
  
  // Canvas & surfaces
  canvas: '#F4F4F4',
  surface: '#FFFFFF',
  
  // Vibrant accents
  violet: '#A78BFA',
  violetDark: '#7C3AED',
  violetLight: '#C4B5FD',
  
  teal: '#2DD4BF',
  tealDark: '#14B8A6',
  tealLight: '#5EEAD4',
  
  coral: '#FB7185',
  coralDark: '#F43F5E',
  coralLight: '#FDA4AF',
  
  lime: '#84CC16',
  limeDark: '#65A30D',
  limeLight: '#BEF264',
  
  amber: '#FBBF24',
  amberDark: '#F59E0B',
  amberLight: '#FCD34D',
  
  // Pastels for sections
  pastelViolet: '#EDE9FE',
  pastelTeal: '#CCFBF1',
  pastelCoral: '#FFE4E6',
  pastelLime: '#ECFCCB',
  pastelAmber: '#FEF3C7',
  
  // Grays
  gray50: '#FAFAFA',
  gray100: '#F4F4F4',
  gray200: '#E5E5E5',
  gray300: '#D4D4D4',
  gray400: '#A3A3A3',
  gray500: '#737373',
  gray600: '#525252',
  gray700: '#404040',
  gray800: '#262626',
  gray900: '#171717',
  
  // Semantic colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Borders - always bold
  border: '#0A0A0A',
  borderLight: '#D4D4D4',
  
  // Shadows - hard and offset
  shadow: '#0A0A0A',
};

export const NeoBrutalistSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const NeoBrutalistFontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 48,
  displayLg: 56,
  displayXl: 64,
};

export const NeoBrutalistFontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  black: '900' as const,
};

export const NeoBrutalistBorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const NeoBrutalistBorders = {
  thin: 1,
  medium: 2,
  thick: 3,
  extraThick: 4,
};

// Hard, offset shadows for neo-brutalist depth
export const NeoBrutalistShadows = {
  sm: {
    shadowColor: NeoBrutalistColors.shadow,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  md: {
    shadowColor: NeoBrutalistColors.shadow,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  lg: {
    shadowColor: NeoBrutalistColors.shadow,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  xl: {
    shadowColor: NeoBrutalistColors.shadow,
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
};

export const NeoBrutalistTransitions = {
  fast: 150,
  normal: 200,
  slow: 300,
};

const cardBase: ViewStyle = {
  backgroundColor: NeoBrutalistColors.surface,
  borderWidth: NeoBrutalistBorders.thick,
  borderColor: NeoBrutalistColors.border,
  borderRadius: NeoBrutalistBorderRadius.md,
  ...NeoBrutalistShadows.md,
};

const buttonBase: ViewStyle = {
  borderWidth: NeoBrutalistBorders.thick,
  borderColor: NeoBrutalistColors.border,
  borderRadius: NeoBrutalistBorderRadius.md,
  paddingHorizontal: NeoBrutalistSpacing.lg,
  paddingVertical: NeoBrutalistSpacing.md,
  ...NeoBrutalistShadows.sm,
  alignItems: 'center',
  justifyContent: 'center',
};

const pillBase: ViewStyle = {
  borderWidth: NeoBrutalistBorders.medium,
  borderColor: NeoBrutalistColors.border,
  borderRadius: NeoBrutalistBorderRadius.full,
  paddingHorizontal: NeoBrutalistSpacing.md,
  paddingVertical: NeoBrutalistSpacing.xs,
  ...NeoBrutalistShadows.sm,
};

type NeoCardVariants = {
  default: ViewStyle;
  spacious: ViewStyle;
  pastel: (tone?: keyof typeof NeoBrutalistColors) => ViewStyle;
};

type NeoButtonVariants = {
  primary: ViewStyle;
  outline: ViewStyle;
  ghost: ViewStyle;
  success: ViewStyle;
  danger: ViewStyle;
  secondary: ViewStyle;
};

type NeoPillVariants = {
  neutral: ViewStyle;
  lime: ViewStyle;
  violet: ViewStyle;
};

type NeoComponentTokens = {
  card: NeoCardVariants;
  button: NeoButtonVariants;
  input: ViewStyle;
  badge: ViewStyle;
  pill: NeoPillVariants;
  panel: ViewStyle;
  listItem: ViewStyle;
  fab: ViewStyle;
};

// Component-specific presets
export const NeoBrutalistComponents: NeoComponentTokens = {
  card: {
    default: {
      ...cardBase,
      padding: NeoBrutalistSpacing.lg,
    },
    spacious: {
      ...cardBase,
      padding: NeoBrutalistSpacing.xl,
      borderRadius: NeoBrutalistBorderRadius.lg,
      ...NeoBrutalistShadows.lg,
    },
    pastel: (tone: keyof typeof NeoBrutalistColors = 'pastelViolet') => ({
      ...cardBase,
      backgroundColor: (NeoBrutalistColors as any)[tone] ?? NeoBrutalistColors.pastelViolet,
    }),
  },
  button: {
    primary: {
      ...buttonBase,
      backgroundColor: NeoBrutalistColors.violet,
    },
    outline: {
      ...buttonBase,
      backgroundColor: NeoBrutalistColors.surface,
    },
    ghost: {
      ...buttonBase,
      backgroundColor: NeoBrutalistColors.canvas,
    },
    success: {
      ...buttonBase,
      backgroundColor: NeoBrutalistColors.teal,
    },
    danger: {
      ...buttonBase,
      backgroundColor: NeoBrutalistColors.coral,
    },
    secondary: {
      ...buttonBase,
      backgroundColor: NeoBrutalistColors.surface,
    },
  },
  input: {
    backgroundColor: NeoBrutalistColors.surface,
    borderWidth: NeoBrutalistBorders.medium,
    borderColor: NeoBrutalistColors.border,
    borderRadius: NeoBrutalistBorderRadius.sm,
    paddingHorizontal: NeoBrutalistSpacing.md,
    paddingVertical: NeoBrutalistSpacing.sm,
  },
  badge: {
    ...pillBase,
    backgroundColor: NeoBrutalistColors.amber,
  },
  pill: {
    neutral: {
      ...pillBase,
      backgroundColor: NeoBrutalistColors.surface,
    },
    lime: {
      ...pillBase,
      backgroundColor: NeoBrutalistColors.limeLight,
    },
    violet: {
      ...pillBase,
      backgroundColor: NeoBrutalistColors.violetLight,
    },
  },
  panel: {
    ...cardBase,
    backgroundColor: NeoBrutalistColors.surface,
    padding: NeoBrutalistSpacing.lg,
  },
  listItem: {
    backgroundColor: NeoBrutalistColors.surface,
    borderWidth: NeoBrutalistBorders.medium,
    borderColor: NeoBrutalistColors.border,
    borderRadius: NeoBrutalistBorderRadius.sm,
    paddingHorizontal: NeoBrutalistSpacing.lg,
    paddingVertical: NeoBrutalistSpacing.md,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: NeoBrutalistBorderRadius.md,
    backgroundColor: NeoBrutalistColors.violet,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: NeoBrutalistBorders.thick,
    borderColor: NeoBrutalistColors.border,
    ...NeoBrutalistShadows.md,
  },
};

type NeoTypographyTokens = Record<string, TextStyle>;

export const NeoBrutalistTypography: NeoTypographyTokens = {
  display: {
    fontSize: NeoBrutalistFontSizes.display,
    fontWeight: NeoBrutalistFontWeights.black as TextStyle['fontWeight'],
    letterSpacing: 1,
    textTransform: 'uppercase' as TextStyle['textTransform'],
    includeFontPadding: false,
  },
  headline: {
    fontSize: NeoBrutalistFontSizes.xxxl,
    fontWeight: NeoBrutalistFontWeights.extrabold as TextStyle['fontWeight'],
    letterSpacing: 0.5,
    includeFontPadding: false,
  },
  title: {
    fontSize: NeoBrutalistFontSizes.xxl,
    fontWeight: NeoBrutalistFontWeights.extrabold as TextStyle['fontWeight'],
    includeFontPadding: false,
  },
  subtitle: {
    fontSize: NeoBrutalistFontSizes.lg,
    fontWeight: NeoBrutalistFontWeights.semibold as TextStyle['fontWeight'],
  },
  body: {
    fontSize: NeoBrutalistFontSizes.base,
    fontWeight: NeoBrutalistFontWeights.regular as TextStyle['fontWeight'],
  },
  bodyStrong: {
    fontSize: NeoBrutalistFontSizes.base,
    fontWeight: NeoBrutalistFontWeights.bold as TextStyle['fontWeight'],
  },
  bodyLarge: {
    fontSize: NeoBrutalistFontSizes.lg,
    fontWeight: NeoBrutalistFontWeights.semibold as TextStyle['fontWeight'],
  },
  caption: {
    fontSize: NeoBrutalistFontSizes.sm,
    fontWeight: NeoBrutalistFontWeights.medium as TextStyle['fontWeight'],
    letterSpacing: 0.5,
    textTransform: 'uppercase' as TextStyle['textTransform'],
  },
  badge: {
    fontSize: NeoBrutalistFontSizes.xs,
    fontWeight: NeoBrutalistFontWeights.bold as TextStyle['fontWeight'],
    textTransform: 'uppercase' as TextStyle['textTransform'],
    letterSpacing: 1,
  },
  button: {
    fontSize: NeoBrutalistFontSizes.base,
    fontWeight: NeoBrutalistFontWeights.extrabold as TextStyle['fontWeight'],
    textTransform: 'uppercase' as TextStyle['textTransform'],
    includeFontPadding: false,
  },
};
