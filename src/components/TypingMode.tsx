import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GeistColors, GeistSpacing, GeistFontSizes, GeistBorderRadius } from '../theme/geist';
import { Card } from '../types';

interface TypingModeProps {
  currentCard: Card;
  onAnswer: (correct: boolean) => void;
}

const TypingMode: React.FC<TypingModeProps> = ({ currentCard, onAnswer }) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

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
    <View style={styles.container}>
      <View style={styles.questionContainer}>
        <Text style={styles.questionLabel}>Question</Text>
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
                color={GeistColors.background}
              />
              <Text style={styles.resultText}>
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </Text>
            </View>
            {!isCorrect && (
              <View style={styles.correctAnswerContainer}>
                <Text style={styles.correctAnswerLabel}>Correct answer:</Text>
                <Text style={styles.correctAnswerText}>{currentCard.back}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {!showResult && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitButton, !userAnswer.trim() && styles.submitButtonDisabled]}
            onPress={checkAnswer}
            disabled={!userAnswer.trim()}
          >
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
  answerContainer: {
    flex: 1,
  },
  answerLabel: {
    fontSize: GeistFontSizes.sm,
    color: GeistColors.gray600,
    marginBottom: GeistSpacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.sm,
    padding: GeistSpacing.md,
    fontSize: GeistFontSizes.lg,
    color: GeistColors.foreground,
    backgroundColor: GeistColors.background,
  },
  inputCorrect: {
    borderColor: GeistColors.foreground,
    borderWidth: 2,
  },
  inputWrong: {
    borderColor: GeistColors.error,
    borderWidth: 2,
  },
  resultContainer: {
    marginTop: GeistSpacing.lg,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: GeistSpacing.md,
    borderRadius: GeistBorderRadius.sm,
    gap: GeistSpacing.sm,
  },
  resultCorrect: {
    backgroundColor: GeistColors.foreground,
  },
  resultWrong: {
    backgroundColor: GeistColors.error,
  },
  resultText: {
    fontSize: GeistFontSizes.base,
    fontWeight: '500',
    color: GeistColors.background,
  },
  correctAnswerContainer: {
    marginTop: GeistSpacing.md,
    padding: GeistSpacing.md,
    borderWidth: 1,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.sm,
  },
  correctAnswerLabel: {
    fontSize: GeistFontSizes.xs,
    color: GeistColors.gray500,
    marginBottom: GeistSpacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  correctAnswerText: {
    fontSize: GeistFontSizes.lg,
    color: GeistColors.foreground,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: GeistSpacing.sm,
    marginTop: GeistSpacing.lg,
  },
  skipButton: {
    flex: 1,
    padding: GeistSpacing.md,
    borderWidth: 1,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.sm,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: GeistFontSizes.sm,
    color: GeistColors.gray600,
    fontWeight: '500',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  submitButton: {
    flex: 2,
    padding: GeistSpacing.md,
    backgroundColor: GeistColors.foreground,
    borderRadius: GeistBorderRadius.sm,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: GeistFontSizes.sm,
    color: GeistColors.background,
    fontWeight: '500',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default TypingMode;
