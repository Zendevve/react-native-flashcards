import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  GeistColors,
  GeistSpacing,
  GeistFontSizes,
  GeistBorderRadius,
  GeistBorders,
  GeistShadows,
  GeistFontWeights,
  GeistComponents,
  GeistTypography,
} from '../theme/geist';
import { useResponsive } from '../hooks/useResponsive';
import { Card } from '../types';

interface TypingModeProps {
  currentCard: Card;
  onAnswer: (correct: boolean) => void;
}

const TypingMode: React.FC<TypingModeProps> = ({ currentCard, onAnswer }) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const { isPhone } = useResponsive();

  useEffect(() => {
    setUserAnswer('');
    setShowResult(false);
    setIsCorrect(false);
  }, [currentCard]);

  const normalizeString = (str: string): string => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' '); // Normalize whitespace
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    // Simple Levenshtein distance implementation
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    const distance = matrix[str2.length][str1.length];
    const maxLength = Math.max(str1.length, str2.length);
    return 1 - distance / maxLength;
  };

  const checkAnswer = () => {
    Keyboard.dismiss();
    
    const normalizedUser = normalizeString(userAnswer);
    const normalizedCorrect = normalizeString(currentCard.back);
    
    // Check exact match or high similarity (>= 85%)
    const similarity = calculateSimilarity(normalizedUser, normalizedCorrect);
    const correct = normalizedUser === normalizedCorrect || similarity >= 0.85;
    
    setIsCorrect(correct);
    setShowResult(true);
    
    setTimeout(() => {
      onAnswer(correct);
    }, 1500);
  };

  const handleSkip = () => {
    Keyboard.dismiss();
    setShowResult(true);
    setIsCorrect(false);
    
    setTimeout(() => {
      onAnswer(false);
    }, 1500);
  };

  return (
    <View style={[styles.container, isPhone && styles.containerMobile]}>
      <View style={styles.questionCard}>
        <Text style={styles.questionBadge}>Question</Text>
        <Text style={styles.questionText}>{currentCard.front}</Text>
      </View>

      <View style={styles.answerContainer}>
        <Text style={styles.answerLabel}>Type your answer:</Text>
        <TextInput
          style={[
            styles.input,
            showResult && (isCorrect ? styles.inputCorrect : styles.inputWrong),
          ]}
          value={userAnswer}
          onChangeText={setUserAnswer}
          placeholder="Enter answer..."
          placeholderTextColor={GeistColors.gray400}
          autoFocus
          editable={!showResult}
          onSubmitEditing={checkAnswer}
          returnKeyType="done"
        />

        {showResult && (
          <View style={styles.resultContainer}>
            <View style={[styles.resultBadge, isCorrect ? styles.resultCorrect : styles.resultWrong]}>
              <Ionicons
                name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                size={24}
                color={GeistColors.foreground}
              />
              <Text style={styles.resultText}>
                {isCorrect ? '🎉 Correct!' : '❌ Incorrect'}
              </Text>
            </View>
            {!isCorrect && (
              <View style={styles.correctAnswerCard}>
                <Text style={styles.correctAnswerLabel}>Correct answer:</Text>
                <Text style={styles.correctAnswerText}>{currentCard.back}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {!showResult && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.8}>
            <Ionicons name="arrow-forward-outline" size={18} color={GeistColors.gray600} />
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitButton, !userAnswer.trim() && styles.submitButtonDisabled]}
            onPress={checkAnswer}
            disabled={!userAnswer.trim()}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={18} color={GeistColors.foreground} />
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      )}
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
    backgroundColor: GeistColors.pastelAmber,
    minHeight: 150,
    justifyContent: 'center',
    alignItems: 'center',
    gap: GeistSpacing.md,
  },
  questionBadge: {
    ...GeistTypography.badge,
    backgroundColor: GeistColors.amberLight,
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
  answerContainer: {
    gap: GeistSpacing.sm,
  },
  answerLabel: {
    ...GeistTypography.caption,
    color: GeistColors.gray700,
  },
  input: {
    borderWidth: GeistBorders.thick,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.md,
    padding: GeistSpacing.md,
    fontSize: GeistFontSizes.lg,
    color: GeistColors.foreground,
    backgroundColor: GeistColors.surface,
    minHeight: 56,
    ...GeistShadows.sm,
  },
  inputCorrect: {
    backgroundColor: GeistColors.tealLight,
    borderColor: GeistColors.border,
  },
  inputWrong: {
    backgroundColor: GeistColors.coralLight,
    borderColor: GeistColors.border,
  },
  resultContainer: {
    marginTop: GeistSpacing.md,
    gap: GeistSpacing.md,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: GeistSpacing.md,
    borderRadius: GeistBorderRadius.md,
    gap: GeistSpacing.sm,
    borderWidth: GeistBorders.thick,
    borderColor: GeistColors.border,
    ...GeistShadows.sm,
  },
  resultCorrect: {
    backgroundColor: GeistColors.tealLight,
  },
  resultWrong: {
    backgroundColor: GeistColors.coralLight,
  },
  resultText: {
    ...GeistTypography.bodyStrong,
    color: GeistColors.foreground,
  },
  correctAnswerCard: {
    ...GeistComponents.card,
    backgroundColor: GeistColors.surface,
    gap: GeistSpacing.xs,
  },
  correctAnswerLabel: {
    ...GeistTypography.caption,
    color: GeistColors.gray600,
    textTransform: 'uppercase',
  },
  correctAnswerText: {
    ...GeistTypography.bodyLarge,
    color: GeistColors.foreground,
    fontWeight: GeistFontWeights.bold,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: GeistSpacing.sm,
    marginTop: GeistSpacing.md,
  },
  skipButton: {
    flex: 1,
    flexDirection: 'row',
    gap: GeistSpacing.xs,
    padding: GeistSpacing.md,
    borderWidth: GeistBorders.thick,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    backgroundColor: GeistColors.surface,
    ...GeistShadows.sm,
  },
  skipButtonText: {
    ...GeistTypography.bodyStrong,
    color: GeistColors.gray700,
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    gap: GeistSpacing.xs,
    padding: GeistSpacing.md,
    backgroundColor: GeistColors.amber,
    borderWidth: GeistBorders.thick,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    ...GeistShadows.md,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    ...GeistTypography.bodyStrong,
    color: GeistColors.foreground,
    fontWeight: GeistFontWeights.extrabold,
  },
});

export default TypingMode;
