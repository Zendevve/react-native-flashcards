import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  ScrollView,
  PanResponder,
  Dimensions,
  Platform,
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
  GeistTypography,
} from '../theme/geist';
import { speak, stopSpeaking } from '../utils/textToSpeech';
import { useResponsive, useContentWidth } from '../hooks/useResponsive';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.15; // 15% of screen width

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
    deckStats,
    loadDeckStats,
  } = useStore();

  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const [isSpeakingFront, setIsSpeakingFront] = useState(false);
  const [isSpeakingBack, setIsSpeakingBack] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  
  const { isTablet, isSmallDevice } = useResponsive();
  const contentWidth = useContentWidth();

  // Swipe gesture state
  const swipePosition = useRef(new Animated.Value(0)).current;
  const swipeOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    startStudySession(deckId);
    loadDeck(deckId);
    loadDeckStats(deckId);
    return () => {
      stopSpeaking();
    };
  }, [deckId]);

  // Reset flip state when card changes
  useEffect(() => {
    console.log('📍 Card index changed to:', currentCardIndex);
    setIsFlipped(false);
    flipAnimation.setValue(0);
  }, [currentCardIndex]);

  // Debug: Log study cards to verify count
  useEffect(() => {
    if (studyCards.length > 0) {
      console.log(`📚 Study Session: ${studyCards.length} cards loaded`);
      console.log('First card:', studyCards[0]?.front.substring(0, 30));
    }
  }, [studyCards]);

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

  // Pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        swipePosition.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        const swipeDistance = gestureState.dx;
        const velocity = gestureState.vx;
        
        // Determine if swipe should complete based on distance OR velocity
        const shouldSwipeRight = (swipeDistance > SWIPE_THRESHOLD || velocity > 0.3) && currentCardIndex > 0;
        const shouldSwipeLeft = (swipeDistance < -SWIPE_THRESHOLD || velocity < -0.3) && currentCardIndex < studyCards.length - 1;
        
        if (shouldSwipeRight) {
          console.log('👉 Swiping to PREVIOUS card. Current index:', currentCardIndex);
          // Complete swipe to previous card
          previousCard();
          
          Animated.timing(swipePosition, {
            toValue: SCREEN_WIDTH,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            swipePosition.setValue(0);
          });
        } else if (shouldSwipeLeft) {
          console.log('👈 Swiping to NEXT card. Current index:', currentCardIndex);
          // Complete swipe to next card
          nextCard();
          
          Animated.timing(swipePosition, {
            toValue: -SCREEN_WIDTH,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            swipePosition.setValue(0);
          });
        } else {
          console.log('↩️ Spring back - swipe too short. Distance:', swipeDistance);
          // Snap back to center
          Animated.spring(swipePosition, {
            toValue: 0,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

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

  const stats = deckStats[deckId];
  const totalCardsInDeck = stats?.totalCards || 0;
  const currentPosition = currentCardIndex + 1;
  const cardsInSession = studyCards.length;
  const progress = cardsInSession > 0 ? (currentPosition / cardsInSession) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={GeistColors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{currentDeck?.name || 'Study'}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {currentPosition} / {cardsInSession} • Total: {totalCardsInDeck}
            {timeLeft !== null && timeLeft >= 0 && ` • ${timeLeft}s`}
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => navigation.navigate('DeckSettings', { deckId })}
          style={styles.headerButton}
        >
          <Ionicons name="settings-outline" size={24} color={GeistColors.foreground} />
        </TouchableOpacity>
      </View>

      <View style={[styles.cardContainer, isTablet && { maxWidth: contentWidth, alignSelf: 'center', width: '100%' }]}>
        {/* Render current and adjacent cards for smooth carousel */}
        {[currentCardIndex - 1, currentCardIndex, currentCardIndex + 1].map((index) => {
          if (index < 0 || index >= studyCards.length) return null;
          
          const card = studyCards[index];
          const isCurrentCard = index === currentCardIndex;
          const offset = (index - currentCardIndex) * SCREEN_WIDTH;
          
          return (
            <Animated.View
              key={`card-${index}`}
              {...(isCurrentCard ? panResponder.panHandlers : {})}
              style={[
                styles.card,
                isTablet && { maxWidth: 800 },
                isSmallDevice && { width: '100%' },
                {
                  position: isCurrentCard ? 'relative' : 'absolute',
                  transform: [{ translateX: Animated.add(swipePosition, offset) }],
                  opacity: isCurrentCard ? 1 : 0.3,
                },
              ]}
            >
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleFlip}
            style={{ flex: 1 }}
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
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>❓ Question</Text>
              <TouchableOpacity 
                style={styles.speakerButton}
                onPress={handleSpeakFront}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={isSpeakingFront ? "volume-high" : "volume-medium-outline"} 
                  size={20} 
                  color={GeistColors.foreground} 
                />
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={styles.cardTextContainer}
              contentContainerStyle={styles.cardTextContent}
              showsVerticalScrollIndicator={false}
              bounces={true}
            >
              <Text style={styles.cardText}>{card.front}</Text>
            </ScrollView>
            {isCurrentCard && (
              <View style={styles.tapHint}>
                <Ionicons name="hand-left-outline" size={18} color={GeistColors.foreground} />
                <Text style={styles.tapHintText}>Tap to flip • Swipe to navigate</Text>
                <Ionicons name="hand-right-outline" size={18} color={GeistColors.foreground} />
              </View>
            )}
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
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>✅ Answer</Text>
              <TouchableOpacity 
                style={styles.speakerButton}
                onPress={handleSpeakBack}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={isSpeakingBack ? "volume-high" : "volume-medium-outline"} 
                  size={20} 
                  color={GeistColors.foreground} 
                />
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={styles.cardTextContainer}
              contentContainerStyle={styles.cardTextContent}
              showsVerticalScrollIndicator={false}
              bounces={true}
            >
              <Text style={styles.cardText}>{card.back}</Text>
            </ScrollView>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
          );
        })}

        {/* Navigation Arrows (clickable on web, visual indicators on mobile) */}
        {currentCardIndex > 0 && (
          <TouchableOpacity 
            style={styles.swipeIndicatorLeft}
            onPress={() => {
              console.log('⬅️ Previous button clicked');
              previousCard();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={32} color={GeistColors.foreground} />
          </TouchableOpacity>
        )}
        {currentCardIndex < studyCards.length - 1 && (
          <TouchableOpacity 
            style={styles.swipeIndicatorRight}
            onPress={() => {
              console.log('➡️ Next button clicked');
              nextCard();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-forward" size={32} color={GeistColors.foreground} />
          </TouchableOpacity>
        )}
      </View>

      {isFlipped && (
        <View style={styles.ratingContainer}>
          <View style={styles.ratingHeader}>
            {currentCardIndex > 0 && (
              <TouchableOpacity 
                style={styles.previousButton}
                onPress={() => {
                  setIsFlipped(false);
                  previousCard();
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-back" size={18} color={GeistColors.foreground} />
                <Text style={styles.previousButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.ratingTitle}>💭 How well did you know this?</Text>
          </View>
          <View style={styles.ratingButtons}>
            <TouchableOpacity
              style={[styles.ratingButton, styles.ratingButtonAgain]}
              onPress={() => handleRating('again')}
              activeOpacity={0.8}
            >
              <Text style={styles.ratingEmoji}>😰</Text>
              <Text style={styles.ratingButtonText}>Again</Text>
              <Text style={styles.ratingSubtext}>{'<1d'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ratingButton, styles.ratingButtonHard]}
              onPress={() => handleRating('hard')}
              activeOpacity={0.8}
            >
              <Text style={styles.ratingEmoji}>😅</Text>
              <Text style={styles.ratingButtonText}>Hard</Text>
              <Text style={styles.ratingSubtext}>
                {currentCard.interval < 1 ? '1d' : `${Math.round(currentCard.interval * 1.2)}d`}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ratingButton, styles.ratingButtonGood]}
              onPress={() => handleRating('good')}
              activeOpacity={0.8}
            >
              <Text style={styles.ratingEmoji}>😊</Text>
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
              activeOpacity={0.8}
            >
              <Text style={styles.ratingEmoji}>🎉</Text>
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
    fontSize: GeistFontSizes.xl,
    fontWeight: GeistFontWeights.extrabold,
    color: GeistColors.foreground,
    backgroundColor: GeistColors.accentLight,
    paddingHorizontal: GeistSpacing.sm,
    paddingVertical: 4,
    borderWidth: GeistBorders.thick,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.sm,
    textTransform: 'uppercase',
    flexShrink: 1,
    textAlign: 'center',
  },
  headerButton: {
    padding: GeistSpacing.sm,
    borderWidth: GeistBorders.medium,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.sm,
    backgroundColor: GeistColors.surface,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBar: {
    height: 6,
    backgroundColor: GeistColors.gray200,
    borderRadius: GeistBorderRadius.full,
    borderWidth: GeistBorders.medium,
    borderColor: GeistColors.border,
    overflow: 'hidden',
    marginVertical: GeistSpacing.xs,
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: GeistColors.violet,
  },
  progressText: {
    fontSize: GeistFontSizes.xs,
    color: GeistColors.gray700,
    fontWeight: GeistFontWeights.bold,
    textAlign: 'center',
  },
  previousButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GeistSpacing.xs,
    paddingVertical: GeistSpacing.sm,
    paddingHorizontal: GeistSpacing.md,
    borderWidth: GeistBorders.thick,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.md,
    backgroundColor: GeistColors.gray100,
    minHeight: 44,
    ...GeistShadows.sm,
  },
  previousButtonText: {
    ...GeistTypography.bodyStrong,
    color: GeistColors.foreground,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: GeistSpacing.xxl,
    overflow: 'hidden',
  },
  card: {
    width: '100%',
    height: '70%',
    maxHeight: 600,
  },
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    padding: GeistSpacing.xxl,
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
    borderRadius: GeistBorderRadius.xl,
    borderWidth: GeistBorders.thick,
    borderColor: GeistColors.border,
    ...GeistShadows.xl,
  },
  cardFront: {
    backgroundColor: GeistColors.violet,
  },
  cardBack: {
    backgroundColor: GeistColors.teal,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: GeistSpacing.lg,
    paddingTop: GeistSpacing.lg,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  cardLabel: {
    fontSize: GeistFontSizes.base,
    color: GeistColors.foreground,
    fontWeight: GeistFontWeights.black,
    backgroundColor: GeistColors.surface,
    paddingHorizontal: GeistSpacing.lg,
    paddingVertical: GeistSpacing.sm,
    borderWidth: GeistBorders.thick,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.full,
    textTransform: 'uppercase',
    letterSpacing: 1,
    ...GeistShadows.md,
  },
  speakerButton: {
    padding: GeistSpacing.md,
    backgroundColor: GeistColors.surface,
    borderWidth: GeistBorders.thick,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.md,
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    ...GeistShadows.md,
  },
  cardTextContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: GeistSpacing.xl,
    marginTop: GeistSpacing.xxl,
    marginBottom: GeistSpacing.xxl,
  },
  cardTextContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    fontSize: GeistFontSizes.xxl,
    fontWeight: GeistFontWeights.bold,
    color: GeistColors.foreground,
    textAlign: 'center',
    lineHeight: 40,
    flexShrink: 1,
    letterSpacing: 0.5,
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GeistSpacing.sm,
    position: 'absolute',
    bottom: GeistSpacing.xl,
    paddingHorizontal: GeistSpacing.lg,
    paddingVertical: GeistSpacing.md,
    backgroundColor: GeistColors.surface,
    borderWidth: GeistBorders.thick,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.full,
    ...GeistShadows.md,
  },
  tapHintText: {
    fontSize: GeistFontSizes.sm,
    color: GeistColors.foreground,
    fontWeight: GeistFontWeights.extrabold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    padding: GeistSpacing.lg,
    paddingBottom: GeistSpacing.xl,
    gap: GeistSpacing.md,
    ...GeistShadows.md,
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: GeistSpacing.md,
    marginBottom: GeistSpacing.sm,
  },
  ratingTitle: {
    ...GeistTypography.bodyStrong,
    color: GeistColors.foreground,
    flex: 1,
    textAlign: 'center',
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: GeistSpacing.sm,
    flexWrap: 'wrap',
  },
  ratingButton: {
    flex: 1,
    minWidth: 70,
    minHeight: 56,
    paddingVertical: GeistSpacing.md,
    paddingHorizontal: GeistSpacing.sm,
    borderRadius: GeistBorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
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
  ratingEmoji: {
    fontSize: 28,
    marginBottom: GeistSpacing.xs,
  },
  ratingButtonText: {
    color: GeistColors.foreground,
    fontSize: GeistFontSizes.sm,
    fontWeight: GeistFontWeights.extrabold,
    includeFontPadding: false,
    textAlignVertical: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ratingSubtext: {
    fontSize: GeistFontSizes.xs,
    color: GeistColors.gray700,
    marginTop: GeistSpacing.xs,
    fontWeight: GeistFontWeights.bold,
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
  swipeIndicatorLeft: {
    position: 'absolute',
    left: GeistSpacing.lg,
    top: '50%',
    transform: [{ translateY: -16 }],
    backgroundColor: GeistColors.surface,
    borderRadius: GeistBorderRadius.full,
    borderWidth: GeistBorders.thick,
    borderColor: GeistColors.border,
    padding: GeistSpacing.sm,
    ...GeistShadows.md,
    ...(Platform.OS === 'web' && { cursor: 'pointer' as any }),
  },
  swipeIndicatorRight: {
    position: 'absolute',
    right: GeistSpacing.lg,
    top: '50%',
    transform: [{ translateY: -16 }],
    backgroundColor: GeistColors.surface,
    borderRadius: GeistBorderRadius.full,
    borderWidth: GeistBorders.thick,
    borderColor: GeistColors.border,
    padding: GeistSpacing.sm,
    ...GeistShadows.md,
    ...(Platform.OS === 'web' && { cursor: 'pointer' as any }),
  },
});

export default StudyScreen;
