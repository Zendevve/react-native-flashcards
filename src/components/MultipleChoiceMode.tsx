import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GeistColors, GeistSpacing, GeistFontSizes, GeistBorderRadius } from '../theme/geist';
import { Card } from '../types';

interface MultipleChoiceModeProps {
  currentCard: Card;
  allCards: Card[];
  onAnswer: (correct: boolean) => void;
}

const MultipleChoiceMode: React.FC<MultipleChoiceModeProps> = ({
  currentCard,
  allCards,
  onAnswer,
}) => {
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    generateOptions();
    setSelectedOption(null);
    setShowResult(false);
  }, [currentCard]);

  const generateOptions = () => {
    // Get 3 random wrong answers from other cards
    const wrongOptions = allCards
      .filter((card) => card.id !== currentCard.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((card) => card.back);

    // Add correct answer
    const allOptions = [...wrongOptions, currentCard.back];
    
    // Shuffle
    const shuffled = allOptions.sort(() => Math.random() - 0.5);
    setOptions(shuffled);
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setShowResult(true);
    
    const isCorrect = option === currentCard.back;
    
    // Wait a bit before calling onAnswer to show feedback
    setTimeout(() => {
      onAnswer(isCorrect);
    }, 1000);
  };

  const getOptionStyle = (option: string) => {
    if (!showResult) {
      return styles.option;
    }
    
    if (option === currentCard.back) {
      return [styles.option, styles.optionCorrect];
    }
    
    if (option === selectedOption && option !== currentCard.back) {
      return [styles.option, styles.optionWrong];
    }
    
    return [styles.option, styles.optionDisabled];
  };

  const getOptionIcon = (option: string) => {
    if (!showResult) return null;
    
    if (option === currentCard.back) {
      return <Ionicons name="checkmark-circle" size={20} color={GeistColors.background} />;
    }
    
    if (option === selectedOption && option !== currentCard.back) {
      return <Ionicons name="close-circle" size={20} color={GeistColors.background} />;
    }
    
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.questionContainer}>
        <Text style={styles.questionLabel}>Question</Text>
        <Text style={styles.questionText}>{currentCard.front}</Text>
      </View>

      <View style={styles.optionsContainer}>
        <Text style={styles.optionsLabel}>Choose the correct answer:</Text>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={getOptionStyle(option)}
            onPress={() => !showResult && handleOptionSelect(option)}
            disabled={showResult}
          >
            <Text style={[
              styles.optionText,
              showResult && option === currentCard.back && styles.optionTextCorrect,
              showResult && option === selectedOption && option !== currentCard.back && styles.optionTextWrong,
            ]}>
              {option}
            </Text>
            {getOptionIcon(option)}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: GeistSpacing.lg,
  },
  questionContainer: {
    borderWidth: 1,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.md,
    padding: GeistSpacing.xl,
    marginBottom: GeistSpacing.xl,
    minHeight: 150,
    justifyContent: 'center',
  },
  questionLabel: {
    position: 'absolute',
    top: GeistSpacing.md,
    left: GeistSpacing.md,
    fontSize: GeistFontSizes.xs,
    color: GeistColors.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  questionText: {
    fontSize: GeistFontSizes.xxl,
    color: GeistColors.foreground,
    textAlign: 'center',
    lineHeight: 32,
  },
  optionsContainer: {
    flex: 1,
  },
  optionsLabel: {
    fontSize: GeistFontSizes.sm,
    color: GeistColors.gray600,
    marginBottom: GeistSpacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: GeistSpacing.md,
    borderWidth: 1,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.sm,
    marginBottom: GeistSpacing.sm,
    minHeight: 52,
  },
  optionCorrect: {
    backgroundColor: GeistColors.foreground,
    borderColor: GeistColors.foreground,
  },
  optionWrong: {
    backgroundColor: GeistColors.error,
    borderColor: GeistColors.error,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionText: {
    fontSize: GeistFontSizes.base,
    color: GeistColors.foreground,
    flex: 1,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  optionTextCorrect: {
    color: GeistColors.background,
    fontWeight: '500',
  },
  optionTextWrong: {
    color: GeistColors.background,
  },
});

export default MultipleChoiceMode;
