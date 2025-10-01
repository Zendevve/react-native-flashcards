import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  GeistColors,
  GeistSpacing,
  GeistFontSizes,
  GeistBorderRadius,
  GeistBorders,
  GeistShadows,
  GeistFontWeights,
  GeistTypography,
} from '../theme/geist';
import { useResponsive } from '../hooks/useResponsive';
import { StudyMode } from '../types';

interface StudyModeSelectorProps {
  currentMode: StudyMode;
  onModeChange: (mode: StudyMode) => void;
}

const StudyModeSelector: React.FC<StudyModeSelectorProps> = ({ currentMode, onModeChange }) => {
  const { isPhone } = useResponsive();
  const modes: { mode: StudyMode; icon: keyof typeof Ionicons.glyphMap; label: string; description: string }[] = [
    {
      mode: 'flashcard',
      icon: 'layers-outline',
      label: 'Flashcard',
      description: 'Classic flip cards',
    },
    {
      mode: 'multiple-choice',
      icon: 'list-outline',
      label: 'Multiple Choice',
      description: 'Choose correct answer',
    },
    {
      mode: 'typing',
      icon: 'create-outline',
      label: 'Typing',
      description: 'Type the answer',
    },
  ];

  return (
    <View style={[styles.container, isPhone && styles.containerMobile]}>
      {modes.map((item) => {
        const isActive = currentMode === item.mode;
        return (
          <TouchableOpacity
            key={item.mode}
            style={[
              styles.modeCard,
              isActive && styles.modeCardActive,
              isPhone && styles.modeCardMobile,
            ]}
            onPress={() => onModeChange(item.mode)}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
              <Ionicons
                name={item.icon}
                size={isPhone ? 20 : 24}
                color={isActive ? GeistColors.foreground : GeistColors.gray700}
              />
            </View>
            <Text style={[styles.modeLabel, isActive && styles.modeLabelActive]}>
              {item.label}
            </Text>
            <Text style={[styles.modeDescription, isActive && styles.modeDescriptionActive]}>
              {item.description}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: GeistSpacing.sm,
    paddingHorizontal: GeistSpacing.lg,
    paddingVertical: GeistSpacing.md,
  },
  containerMobile: {
    paddingHorizontal: GeistSpacing.md,
    gap: GeistSpacing.xs,
  },
  modeCard: {
    flex: 1,
    padding: GeistSpacing.md,
    borderWidth: GeistBorders.thick,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.md,
    alignItems: 'center',
    backgroundColor: GeistColors.surface,
    gap: GeistSpacing.xs,
    minHeight: 100,
    justifyContent: 'center',
    ...GeistShadows.sm,
  },
  modeCardMobile: {
    minHeight: 90,
    padding: GeistSpacing.sm,
  },
  modeCardActive: {
    backgroundColor: GeistColors.violetLight,
    borderColor: GeistColors.border,
    ...GeistShadows.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: GeistBorderRadius.sm,
    backgroundColor: GeistColors.gray100,
    borderWidth: GeistBorders.medium,
    borderColor: GeistColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    backgroundColor: GeistColors.violet,
  },
  modeLabel: {
    ...GeistTypography.bodyStrong,
    color: GeistColors.foreground,
    textAlign: 'center',
  },
  modeLabelActive: {
    color: GeistColors.foreground,
    fontWeight: GeistFontWeights.extrabold,
  },
  modeDescription: {
    ...GeistTypography.caption,
    color: GeistColors.gray600,
    textAlign: 'center',
  },
  modeDescriptionActive: {
    color: GeistColors.gray700,
    fontWeight: GeistFontWeights.medium,
  },
});

export default StudyModeSelector;
