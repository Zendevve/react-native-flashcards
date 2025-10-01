import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  GeistColors,
  GeistSpacing,
  GeistFontSizes,
  GeistBorderRadius,
  GeistBorders,
  GeistComponents,
  GeistTypography,
} from '../theme/geist';
import { useResponsive } from '../hooks/useResponsive';
import { Card } from '../types';

interface MultipleChoiceModeProps {
  currentCard: Card;
  allCards: Card[];
  onAnswer: (correct: boolean) => void;
}

const MultipleChoiceMode: React.FC<MultipleChoiceModeProps> = ({ currentCard, allCards, onAnswer }) => {
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const { isPhone } = useResponsive();

  const distractors = useMemo(() => allCards.filter((card) => card.id !== currentCard.id), [allCards, currentCard.id]);

  useEffect(() => {
    const shuffled = [...distractors]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((card) => card.back);
    const combined = [...shuffled, currentCard.back].sort(() => Math.random() - 0.5);
    setOptions(combined);
    setSelectedOption(null);
    setShowResult(false);
  }, [currentCard, distractors]);

  const handleOptionSelect = (option: string) => {
    if (showResult) return;
    setSelectedOption(option);
    setShowResult(true);
    const isCorrect = option === currentCard.back;
    setTimeout(() => onAnswer(isCorrect), 1000);
  };

  return (
    <View style={[styles.container, isPhone && styles.containerMobile]}>
      <View style={styles.questionCard}>
        <Text style={styles.questionBadge}>Question</Text>
        <Text style={styles.questionText}>{currentCard.front}</Text>
      </View>

      <View style={styles.optionsWrapper}>
        <Text style={styles.optionsLabel}>Choose the correct answer:</Text>
        {options.map((option) => {
          const isCorrect = showResult && option === currentCard.back;
          const isWrong = showResult && option === selectedOption && option !== currentCard.back;
          return (
            <TouchableOpacity
              key={`${option}`}
              style={[
                styles.optionCard,
                isCorrect && styles.optionCardCorrect,
                isWrong && styles.optionCardWrong,
                showResult && !isCorrect && !isWrong && styles.optionCardDisabled,
              ]}
              activeOpacity={0.8}
              onPress={() => handleOptionSelect(option)}
              disabled={showResult}
            >
              <Text style={[styles.optionText, isCorrect && styles.optionTextCorrect, isWrong && styles.optionTextWrong]}>
                {option}
              </Text>
              {showResult && (
                <Ionicons
                  name={isCorrect ? 'checkmark-circle' : isWrong ? 'close-circle' : 'ellipse-outline'}
                  size={22}
                  color={isCorrect ? GeistColors.tealDark : isWrong ? GeistColors.coralDark : GeistColors.gray400}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: GeistSpacing.lg,
    gap: GeistSpacing.lg,
  },
  containerMobile: {
    padding: GeistSpacing.md,
    gap: GeistSpacing.md,
  },
  questionCard: {
    ...GeistComponents.card.spacious,
    backgroundColor: GeistColors.pastelViolet,
    gap: GeistSpacing.md,
    alignItems: 'center',
  },
  questionBadge: {
    ...GeistTypography.badge,
    backgroundColor: GeistColors.violetLight,
    borderWidth: GeistBorders.medium,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.full,
    paddingHorizontal: GeistSpacing.md,
    paddingVertical: GeistSpacing.xs,
    color: GeistColors.foreground,
  },
  questionText: {
    ...GeistTypography.title,
    textAlign: 'center',
    color: GeistColors.foreground,
  },
  optionsWrapper: {
    gap: GeistSpacing.sm,
  },
  optionsLabel: {
    ...GeistTypography.caption,
    color: GeistColors.gray700,
  },
  optionCard: {
    ...GeistComponents.listItem,
    backgroundColor: GeistColors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 58,
  },
  optionCardCorrect: {
    backgroundColor: GeistColors.tealLight,
  },
  optionCardWrong: {
    backgroundColor: GeistColors.coralLight,
  },
  optionCardDisabled: {
    opacity: 0.6,
  },
  optionText: {
    ...GeistTypography.bodyStrong,
    color: GeistColors.foreground,
    flex: 1,
    marginRight: GeistSpacing.md,
  },
  optionTextCorrect: {
    color: GeistColors.tealDark,
  },
  optionTextWrong: {
    color: GeistColors.coralDark,
  },
});

export default MultipleChoiceMode;
