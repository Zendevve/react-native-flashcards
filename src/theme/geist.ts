// Geist Design System for FlashCards Pro

export const GeistColors = {
  // Base colors
  background: '#ffffff',
  foreground: '#000000',
  
  // Grays
  gray50: '#fafafa',
  gray100: '#f5f5f5',
  gray200: '#e5e5e5',
  gray300: '#d4d4d4',
  gray400: '#a3a3a3',
  gray500: '#737373',
  gray600: '#525252',
  gray700: '#404040',
  gray800: '#262626',
  gray900: '#171717',
  
  // Accents
  accent: '#0070f3',
  accentLight: '#3291ff',
  accentDark: '#0761d1',
  
  // Semantic colors
  success: '#0070f3',
  warning: '#f5a623',
  error: '#ff0000',
  
  // Borders
  border: '#eaeaea',
  borderDark: '#333',
  
  // Shadows
  shadow: 'rgba(0, 0, 0, 0.12)',
};

export const GeistSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const GeistFontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 48,
};

export const GeistFontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const GeistBorderRadius = {
  none: 0,
  sm: 4,
  md: 6,
  lg: 8,
  full: 9999,
};

export const GeistShadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
};

export const GeistTransitions = {
  fast: 150,
  normal: 200,
  slow: 300,
};
