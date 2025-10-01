import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

export interface ResponsiveInfo {
  width: number;
  height: number;
  isSmallDevice: boolean;
  isMediumDevice: boolean;
  isLargeDevice: boolean;
  isTablet: boolean;
  isPhone: boolean;
  orientation: 'portrait' | 'landscape';
  scale: number;
}

export const useResponsive = (): ResponsiveInfo => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const { width, height, scale } = dimensions;
  const isPortrait = height >= width;
  const shortDimension = Math.min(width, height);
  const longDimension = Math.max(width, height);

  // Device categorization
  const isSmallDevice = shortDimension < 375; // iPhone SE, small phones
  const isMediumDevice = shortDimension >= 375 && shortDimension < 768; // Standard phones
  const isLargeDevice = shortDimension >= 768; // Tablets, web
  const isTablet = shortDimension >= 600;
  const isPhone = shortDimension < 600;

  return {
    width,
    height,
    isSmallDevice,
    isMediumDevice,
    isLargeDevice,
    isTablet,
    isPhone,
    orientation: isPortrait ? 'portrait' : 'landscape',
    scale,
  };
};

// Responsive value selector
export const useResponsiveValue = <T,>(values: {
  small?: T;
  medium?: T;
  large?: T;
  default: T;
}): T => {
  const { isSmallDevice, isMediumDevice, isLargeDevice } = useResponsive();

  if (isLargeDevice && values.large !== undefined) return values.large;
  if (isMediumDevice && values.medium !== undefined) return values.medium;
  if (isSmallDevice && values.small !== undefined) return values.small;
  return values.default;
};

// Responsive spacing
export const useResponsiveSpacing = () => {
  const { isSmallDevice, isTablet } = useResponsive();

  return {
    xs: isSmallDevice ? 2 : 4,
    sm: isSmallDevice ? 6 : 8,
    md: isSmallDevice ? 12 : isTablet ? 20 : 16,
    lg: isSmallDevice ? 18 : isTablet ? 32 : 24,
    xl: isSmallDevice ? 24 : isTablet ? 40 : 32,
    xxl: isSmallDevice ? 36 : isTablet ? 64 : 48,
  };
};

// Responsive font sizes
export const useResponsiveFontSize = () => {
  const { isSmallDevice, isTablet } = useResponsive();

  return {
    xs: isSmallDevice ? 10 : isTablet ? 14 : 12,
    sm: isSmallDevice ? 12 : isTablet ? 16 : 14,
    base: isSmallDevice ? 14 : isTablet ? 18 : 16,
    lg: isSmallDevice ? 16 : isTablet ? 20 : 18,
    xl: isSmallDevice ? 18 : isTablet ? 24 : 20,
    xxl: isSmallDevice ? 20 : isTablet ? 28 : 24,
    xxxl: isSmallDevice ? 24 : isTablet ? 40 : 32,
  };
};

// Get number of columns for grid layouts
export const useGridColumns = (baseColumns: number = 2): number => {
  const { width, isTablet } = useResponsive();

  if (width >= 1200) return baseColumns * 3; // Large desktop
  if (width >= 900) return baseColumns * 2; // Desktop/tablet landscape
  if (isTablet) return baseColumns + 1; // Tablet portrait
  return baseColumns; // Phone
};

// Check if device is in landscape
export const useIsLandscape = (): boolean => {
  const { orientation } = useResponsive();
  return orientation === 'landscape';
};

// Get safe content width (for centering on large screens)
export const useContentWidth = (): number => {
  const { width } = useResponsive();
  
  if (width > 1200) return 1200; // Max width for very large screens
  if (width > 900) return width * 0.9; // 90% on desktop
  return width; // Full width on mobile
};
