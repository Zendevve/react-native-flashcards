import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GeistColors, GeistSpacing, GeistFontSizes, GeistBorderRadius } from '../theme/geist';
import { StudyMode } from '../types';

interface StudyModeSelectorProps {
  currentMode: StudyMode;
  onModeChange: (mode: StudyMode) => void;
}

const StudyModeSelector: React.FC<StudyModeSelectorProps> = ({ currentMode, onModeChange }) => {
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
    <View style={styles.container}>
      {modes.map((item) => (
        <TouchableOpacity
          key={item.mode}
          style={[styles.modeCard, currentMode === item.mode && styles.modeCardActive]}
          onPress={() => onModeChange(item.mode)}
        >
          <Ionicons
            name={item.icon}
            size={24}
            color={currentMode === item.mode ? GeistColors.background : GeistColors.foreground}
          />
          <Text style={[styles.modeLabel, currentMode === item.mode && styles.modeLabelActive]}>
            {item.label}
          </Text>
          <Text style={[styles.modeDescription, currentMode === item.mode && styles.modeDescriptionActive]}>
            {item.description}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: GeistSpacing.sm,
    paddingHorizontal: GeistSpacing.md,
    paddingVertical: GeistSpacing.md,
  },
  modeCard: {
    flex: 1,
    padding: GeistSpacing.md,
    borderWidth: 1,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.md,
    alignItems: 'center',
  },
  modeCardActive: {
    backgroundColor: GeistColors.foreground,
    borderColor: GeistColors.foreground,
  },
  modeLabel: {
    fontSize: GeistFontSizes.sm,
    fontWeight: '500',
    color: GeistColors.foreground,
    marginTop: GeistSpacing.xs,
  },
  modeLabelActive: {
    color: GeistColors.background,
  },
  modeDescription: {
    fontSize: GeistFontSizes.xs,
    color: GeistColors.gray500,
    marginTop: 2,
    textAlign: 'center',
  },
  modeDescriptionActive: {
    color: GeistColors.gray300,
  },
});

export default StudyModeSelector;
