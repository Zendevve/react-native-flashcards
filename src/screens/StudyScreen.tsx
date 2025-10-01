import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useStore } from '../store/useStore';
import { Rating } from '../types';
import { calculateNextReview } from '../utils/spacedRepetition';
import {
  GeistColors,
  GeistSpacing,
  GeistFontSizes,
  GeistBorderRadius,
  GeistShadows,
  GeistFontWeights,
  GeistBorders,
  GeistComponents,
} from '../theme/geist';
import { speak, stopSpeaking } from '../utils/textToSpeech';
import { useResponsive, useContentWidth } from '../hooks/useResponsive';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Study'>;
type RouteProps = RouteProp<RootStackParamList, 'Study'>;

const StudyScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { deckId } = route.params;

  const {
    studyCards,
    currentCard,
    currentCardIndex,
    sessionStats,
    startStudySession,
    nextCard,
    previousCard,
    resetSession,
    updateCard,
    currentDeck,
    loadDeck,
  } = useStore();

  const [isFlipped, setIsFlipped] = useState(false);
  const [flipAnimation] = useState(new Animated.Value(0));
  const [isSpeakingFront, setIsSpeakingFront] = useState(false);
  const [isSpeakingBack, setIsSpeakingBack] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  
  const { isTablet, isSmallDevice } = useResponsive();
  const contentWidth = useContentWidth();

  useEffect(() => {
    startStudySession(deckId);
    loadDeck(deckId);
    return () => {
      stopSpeaking();
    };
  }, [deckId]);

  // Exit confirmation removed - was blocking navigation
  // TODO: Re-implement with better UX later

  // Auto-speak question when card changes
  useEffect(() => {
    if (currentCard && currentDeck?.settings.autoSpeakQuestion && !isFlipped) {
      handleSpeakFront();
    }
  }, [currentCard, isFlipped]);

  // Auto-speak answer when card is flipped
  useEffect(() => {
    if (currentCard && currentDeck?.settings.autoSpeakAnswer && isFlipped) {
      handleSpeakBack();
    }
  }, [isFlipped]);

  // Timer countdown
  useEffect(() => {
    if (!currentCard || !currentDeck?.settings.enableTimer || isFlipped) {
      setTimeLeft(null);
      return;
    }

    // Start timer
    setTimeLeft(currentDeck.settings.timerDuration);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          // Auto-flip when time runs out
          if (!isFlipped) {
            handleFlip();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentCard, isFlipped, currentDeck?.settings.enableTimer]);

  // Get card content (respecting invert setting)
  const getCardContent = () => {
    if (!currentCard) return { front: '', back: '' };
    const inverted = currentDeck?.settings.cardInverted || false;
    return {
      front: inverted ? currentCard.back : currentCard.front,
      back: inverted ? currentCard.front : currentCard.back,
    };
  };

  const cardContent = getCardContent();

  const handleSpeakFront = async () => {
    if (!currentCard) return;
    setIsSpeakingFront(true);
    await speak(cardContent.front, {
      language: currentDeck?.settings.questionLanguage || 'en-US',
    });
    setIsSpeakingFront(false);
  };

  const handleSpeakBack = async () => {
    if (!currentCard) return;
    setIsSpeakingBack(true);
    await speak(cardContent.back, {
      language: currentDeck?.settings.answerLanguage || 'en-US',
    });
    setIsSpeakingBack(false);
  };

  const handleFlip = () => {
    Animated.spring(flipAnimation, {
      toValue: isFlipped ? 0 : 180,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const handleRating = async (rating: Rating) => {
    if (!currentCard) return;

    const reviewResult = calculateNextReview(currentCard, rating);

    await updateCard(currentCard.id, {
      interval: reviewResult.interval,
      easeFactor: reviewResult.easeFactor,
      repetitions: reviewResult.repetitions,
      nextReviewDate: reviewResult.nextReviewDate,
      state: reviewResult.state,
      lastReviewed: Date.now(),
    });

    // Update session stats
    useStore.setState((state) => ({
      sessionStats: {
        cardsStudied: state.sessionStats.cardsStudied + 1,
        ratings: {
          ...state.sessionStats.ratings,
          [rating]: state.sessionStats.ratings[rating] + 1,
        },
      },
    }));

    // Reset flip state and move to next card
    setIsFlipped(false);
    flipAnimation.setValue(0);
    nextCard();
  };

  const handleExit = () => {
    Alert.alert(
      'Exit Study Session',
      'Are you sure you want to exit? Your progress will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit',
          onPress: () => {
            resetSession();
            navigation.goBack();
          },
        },
      ]
    );
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = flipAnimation.interpolate({
    inputRange: [0, 90, 90, 180],
    outputRange: [1, 1, 0, 0],
  });

  const backOpacity = flipAnimation.interpolate({
    inputRange: [0, 90, 90, 180],
    outputRange: [0, 0, 1, 1],
  });

  if (!currentCard) {
    return (
      <View style={styles.container}>
        <View style={styles.completionContainer}>
          <Ionicons name="checkmark-circle" size={80} color={GeistColors.foreground} />
          <Text style={styles.completionTitle}>Session Complete!</Text>
          <Text style={styles.completionText}>
            You studied {sessionStats.cardsStudied} cards
          </Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {sessionStats.ratings.again}
              </Text>
              <Text style={styles.statLabel}>Again</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {sessionStats.ratings.hard}
              </Text>
              <Text style={styles.statLabel}>Hard</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {sessionStats.ratings.good}
              </Text>
              <Text style={styles.statLabel}>Good</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {sessionStats.ratings.easy}
              </Text>
              <Text style={styles.statLabel}>Easy</Text>
            </View>
          </View>
          <View style={styles.completionButtons}>
            <TouchableOpacity
              style={styles.primaryCompletionButton}
              onPress={() => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'MainTabs' }],
                });
              }}
            >
              <Ionicons name="home" size={20} color={GeistColors.background} />
              <Text style={styles.primaryCompletionButtonText}>Back to Home</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryCompletionButton}
              onPress={() => {
                resetSession();
                startStudySession(deckId);
              }}
            >
              <Ionicons name="refresh" size={20} color={GeistColors.foreground} />
              <Text style={styles.secondaryCompletionButtonText}>Study Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const progress = ((currentCardIndex + 1) / studyCards.length) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={GeistColors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{currentDeck?.name || 'Study'}</Text>
          {timeLeft !== null && timeLeft >= 0 && (
            <Text style={[styles.timerText, timeLeft <= 5 && styles.timerWarning]}>
              ⏱️ {timeLeft}s
            </Text>
          )}
          {currentCardIndex === studyCards.length - 1 && studyCards.length > 1 && (
            <Text style={styles.lastCardBadge}>🎉 Last card!</Text>
          )}
        </View>
        <TouchableOpacity 
          onPress={() => navigation.navigate('DeckSettings', { deckId })}
          style={styles.headerButton}
        >
          <Ionicons name="settings-outline" size={24} color={GeistColors.foreground} />
        </TouchableOpacity>
      </View>

      <View style={[styles.cardContainer, isTablet && { maxWidth: contentWidth, alignSelf: 'center', width: '100%' }]}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleFlip}
          style={[styles.card, isTablet && { maxWidth: 800 }, isSmallDevice && { width: '100%' }]}
        >
          <Animated.View
            style={[
              styles.cardFace,
              styles.cardFront,
              {
                transform: [{ rotateY: frontInterpolate }],
                opacity: frontOpacity,
              },
            ]}
          >
            <Text style={styles.cardLabel}>Question</Text>
            <TouchableOpacity 
              style={styles.speakerButton}
              onPress={handleSpeakFront}
            >
              <Ionicons 
                name={isSpeakingFront ? "volume-high" : "volume-medium-outline"} 
                size={24} 
                color={GeistColors.gray500} 
              />
            </TouchableOpacity>
            <ScrollView 
              style={styles.cardTextContainer}
              contentContainerStyle={styles.cardTextContent}
              showsVerticalScrollIndicator={true}
              bounces={true}
            >
              <Text style={styles.cardText}>{cardContent.front}</Text>
            </ScrollView>
            <View style={styles.tapHint}>
              <Ionicons name="hand-left-outline" size={16} color={GeistColors.foreground} />
              <Text style={styles.tapHintText}>Tap to reveal answer</Text>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.cardFace,
              styles.cardBack,
              {
                transform: [{ rotateY: backInterpolate }],
                opacity: backOpacity,
              },
            ]}
          >
            <Text style={styles.cardLabel}>Answer</Text>
            <TouchableOpacity 
              style={styles.speakerButton}
              onPress={handleSpeakBack}
            >
              <Ionicons 
                name={isSpeakingBack ? "volume-high" : "volume-medium-outline"} 
                size={24} 
                color={GeistColors.gray500} 
              />
            </TouchableOpacity>
            <ScrollView 
              style={styles.cardTextContainer}
              contentContainerStyle={styles.cardTextContent}
              showsVerticalScrollIndicator={true}
              bounces={true}
            >
              <Text style={styles.cardText}>{cardContent.back}</Text>
            </ScrollView>
          </Animated.View>
        </TouchableOpacity>
      </View>

      {isFlipped && (
        <View style={styles.ratingContainer}>
          {currentCardIndex > 0 && (
            <TouchableOpacity 
              style={styles.previousButton}
              onPress={() => {
                setIsFlipped(false);
                previousCard();
              }}
            >
              <Ionicons name="arrow-back" size={16} color={GeistColors.gray600} />
              <Text style={styles.previousButtonText}>Previous</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.ratingTitle}>How well did you know this?</Text>
          <View style={styles.ratingButtons}>
            <TouchableOpacity
              style={[styles.ratingButton, styles.ratingButtonAgain]}
              onPress={() => handleRating('again')}
            >
              <Text style={styles.ratingButtonText}>Again</Text>
              <Text style={styles.ratingSubtext}>{'<1d'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ratingButton, styles.ratingButtonHard]}
              onPress={() => handleRating('hard')}
            >
              <Text style={styles.ratingButtonText}>Hard</Text>
              <Text style={styles.ratingSubtext}>
                {currentCard.interval < 1 ? '1d' : `${Math.round(currentCard.interval * 1.2)}d`}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ratingButton, styles.ratingButtonGood]}
              onPress={() => handleRating('good')}
            >
              <Text style={styles.ratingButtonText}>Good</Text>
              <Text style={styles.ratingSubtext}>
                {currentCard.repetitions === 0
                  ? '1d'
                  : currentCard.repetitions === 1
                  ? '3d'
                  : `${Math.round(currentCard.interval * currentCard.easeFactor)}d`}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ratingButton, styles.ratingButtonEasy]}
              onPress={() => handleRating('easy')}
            >
              <Text style={styles.ratingButtonText}>Easy</Text>
              <Text style={styles.ratingSubtext}>
                {currentCard.repetitions === 0
                  ? '3d'
                  : currentCard.repetitions === 1
                  ? '7d'
                  : `${Math.round(currentCard.interval * currentCard.easeFactor * 1.3)}d`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GeistColors.canvas,
    paddingBottom: GeistSpacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: GeistSpacing.lg,
    paddingTop: GeistSpacing.lg,
    paddingBottom: GeistSpacing.md,
    backgroundColor: GeistColors.surface,
    borderBottomWidth: GeistBorders.thick,
    borderBottomColor: GeistColors.border,
    gap: GeistSpacing.sm,
    ...GeistShadows.sm,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    gap: GeistSpacing.xs,
  },
  headerTitle: {
    fontSize: GeistFontSizes.xxxl,
    fontWeight: GeistFontWeights.extrabold,
    color: GeistColors.foreground,
    backgroundColor: GeistColors.accentLight,
    paddingHorizontal: GeistSpacing.sm,
    paddingVertical: 4,
    borderWidth: GeistBorders.thick,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.sm,
    textTransform: 'uppercase',
  },
  headerButton: {
    padding: GeistSpacing.xs,
    borderWidth: GeistBorders.medium,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.sm,
    backgroundColor: GeistColors.surface,
  },
  timerText: {
    fontSize: GeistFontSizes.sm,
    color: GeistColors.foreground,
    backgroundColor: GeistColors.violetLight,
    paddingHorizontal: GeistSpacing.sm,
    paddingVertical: 2,
    borderWidth: GeistBorders.medium,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.full,
  },
  timerWarning: {
    backgroundColor: GeistColors.coralLight,
    color: GeistColors.foreground,
  },
  lastCardBadge: {
    fontSize: GeistFontSizes.xs,
    color: GeistColors.foreground,
    fontWeight: GeistFontWeights.bold,
    marginTop: 2,
    backgroundColor: GeistColors.limeLight,
    paddingHorizontal: GeistSpacing.sm,
    paddingVertical: 2,
    borderWidth: GeistBorders.medium,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.full,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  previousButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GeistSpacing.xs,
    paddingVertical: GeistSpacing.sm,
    paddingHorizontal: GeistSpacing.md,
    alignSelf: 'flex-start',
    marginBottom: GeistSpacing.sm,
    borderWidth: GeistBorders.medium,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.sm,
    backgroundColor: GeistColors.surface,
    ...GeistShadows.sm,
  },
  previousButtonText: {
    fontSize: GeistFontSizes.sm,
    color: GeistColors.gray600,
    fontWeight: '500',
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: GeistSpacing.md,
  },
  progressText: {
    color: GeistColors.gray600,
    fontSize: GeistFontSizes.xs,
    textAlign: 'center',
    marginBottom: GeistSpacing.xs,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressBar: {
    height: GeistBorders.medium,
    backgroundColor: GeistColors.gray200,
    borderRadius: GeistBorderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: GeistColors.accent,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: GeistSpacing.xxl,
  },
  card: {
    width: '100%',
    height: '70%',
    maxHeight: 500,
    ...GeistShadows.lg,
  },
  cardFace: {
    ...GeistComponents.card,
    position: 'absolute',
    width: '100%',
    height: '100%',
    padding: GeistSpacing.xxl,
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
  },
  cardFront: {
    backgroundColor: GeistColors.pastelViolet,
  },
  cardBack: {
    backgroundColor: GeistColors.pastelTeal,
  },
  cardLabel: {
    position: 'absolute',
    top: GeistSpacing.lg,
    fontSize: GeistFontSizes.xs,
    color: GeistColors.foreground,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: GeistFontWeights.bold,
    backgroundColor: GeistColors.surface,
    paddingHorizontal: GeistSpacing.sm,
    paddingVertical: 2,
    borderWidth: GeistBorders.medium,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.full,
  },
  speakerButton: {
    position: 'absolute',
    top: GeistSpacing.lg,
    right: GeistSpacing.lg,
    padding: GeistSpacing.sm,
    backgroundColor: GeistColors.surface,
    borderWidth: GeistBorders.medium,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.sm,
    ...GeistShadows.sm,
  },
  cardTextContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: GeistSpacing.lg,
    marginTop: GeistSpacing.xl,
    marginBottom: GeistSpacing.xxl,
  },
  cardTextContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: GeistSpacing.md,
    minHeight: 200,
  },
  cardText: {
    fontSize: GeistFontSizes.xxxl,
    color: GeistColors.foreground,
    textAlign: 'center',
    lineHeight: 40,
    fontWeight: GeistFontWeights.bold,
  },
  tapHint: {
    position: 'absolute',
    bottom: GeistSpacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: GeistSpacing.xs,
    backgroundColor: GeistColors.surface,
    borderWidth: GeistBorders.medium,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.full,
    paddingHorizontal: GeistSpacing.md,
    paddingVertical: 6,
    ...GeistShadows.sm,
  },
  tapHintText: {
    fontSize: GeistFontSizes.sm,
    color: GeistColors.foreground,
    fontWeight: GeistFontWeights.medium,
  },
  hintContainer: {
    position: 'absolute',
    bottom: GeistSpacing.xxxl + 20,
    alignSelf: 'center',
    alignItems: 'center',
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GeistSpacing.xs,
    paddingHorizontal: GeistSpacing.md,
    paddingVertical: GeistSpacing.sm,
    borderWidth: GeistBorders.medium,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.sm,
    backgroundColor: GeistColors.pastelAmber,
    ...GeistShadows.sm,
  },
  hintButtonText: {
    fontSize: GeistFontSizes.sm,
    color: GeistColors.foreground,
    fontWeight: GeistFontWeights.medium,
  },
  hintText: {
    fontSize: GeistFontSizes.xl,
    color: GeistColors.foreground,
    fontWeight: GeistFontWeights.black,
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  ratingContainer: {
    backgroundColor: GeistColors.surface,
    borderTopWidth: GeistBorders.thick,
    borderTopColor: GeistColors.border,
    padding: GeistSpacing.xl,
    paddingBottom: GeistSpacing.xxl,
    ...GeistShadows.md,
  },
  ratingTitle: {
    fontSize: GeistFontSizes.sm,
    fontWeight: '500',
    color: GeistColors.foreground,
    textAlign: 'center',
    marginBottom: GeistSpacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: GeistSpacing.sm,
    flexWrap: 'wrap',
  },
  ratingButton: {
    flex: 1,
    minWidth: 70,
    paddingVertical: GeistSpacing.md,
    borderRadius: GeistBorderRadius.md,
    alignItems: 'center',
    borderWidth: GeistBorders.thick,
    borderColor: GeistColors.border,
    backgroundColor: GeistColors.surface,
    ...GeistShadows.sm,
  },
  ratingButtonAgain: {
    backgroundColor: GeistColors.coralLight,
  },
  ratingButtonHard: {
    backgroundColor: GeistColors.amberLight,
  },
  ratingButtonGood: {
    backgroundColor: GeistColors.tealLight,
  },
  ratingButtonEasy: {
    backgroundColor: GeistColors.limeLight,
  },
  ratingButtonText: {
    color: GeistColors.foreground,
    fontSize: GeistFontSizes.base,
    fontWeight: GeistFontWeights.extrabold,
    includeFontPadding: false,
    textAlignVertical: 'center',
    textTransform: 'uppercase',
  },
  ratingSubtext: {
    fontSize: GeistFontSizes.xs,
    color: GeistColors.gray700,
    marginTop: 4,
    fontWeight: GeistFontWeights.medium,
  },
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: GeistSpacing.xxl,
    backgroundColor: GeistColors.pastelViolet,
    borderWidth: GeistBorders.thick,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.lg,
    gap: GeistSpacing.lg,
    ...GeistShadows.lg,
  },
  completionTitle: {
    fontSize: GeistFontSizes.display,
    fontWeight: GeistFontWeights.black,
    color: GeistColors.foreground,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  completionText: {
    fontSize: GeistFontSizes.lg,
    color: GeistColors.gray700,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: GeistColors.surface,
    borderWidth: GeistBorders.thick,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.lg,
    padding: GeistSpacing.lg,
    marginBottom: GeistSpacing.xl,
    gap: GeistSpacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: GeistFontSizes.xxxl,
    fontWeight: GeistFontWeights.black,
    color: GeistColors.foreground,
  },
  statLabel: {
    fontSize: GeistFontSizes.xs,
    color: GeistColors.gray600,
    marginTop: GeistSpacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  completionButtons: {
    flexDirection: 'row',
    gap: GeistSpacing.md,
    marginTop: GeistSpacing.xl,
    width: '100%',
    paddingHorizontal: GeistSpacing.lg,
  },
  primaryCompletionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GeistColors.violet,
    paddingVertical: GeistSpacing.md,
    borderRadius: GeistBorderRadius.md,
    gap: GeistSpacing.xs,
    borderWidth: GeistBorders.thick,
    borderColor: GeistColors.border,
    ...GeistShadows.sm,
  },
  primaryCompletionButtonText: {
    color: GeistColors.foreground,
    fontSize: GeistFontSizes.base,
    fontWeight: GeistFontWeights.extrabold,
    textTransform: 'uppercase',
  },
  secondaryCompletionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GeistColors.surface,
    borderWidth: GeistBorders.thick,
    borderColor: GeistColors.border,
    paddingVertical: GeistSpacing.md,
    borderRadius: GeistBorderRadius.md,
    gap: GeistSpacing.xs,
    ...GeistShadows.sm,
  },
  secondaryCompletionButtonText: {
    color: GeistColors.foreground,
    fontSize: GeistFontSizes.base,
    fontWeight: GeistFontWeights.extrabold,
    textTransform: 'uppercase',
  },
  doneButton: {
    backgroundColor: GeistColors.coral,
    paddingVertical: GeistSpacing.md,
    paddingHorizontal: GeistSpacing.xxl,
    borderRadius: GeistBorderRadius.md,
    borderWidth: GeistBorders.thick,
    borderColor: GeistColors.border,
    ...GeistShadows.sm,
    marginTop: GeistSpacing.xl,
  },
  doneButtonText: {
    color: GeistColors.foreground,
    fontSize: GeistFontSizes.base,
    fontWeight: GeistFontWeights.extrabold,
    includeFontPadding: false,
    textAlignVertical: 'center',
    textTransform: 'uppercase',
  },
});

export default StudyScreen;
