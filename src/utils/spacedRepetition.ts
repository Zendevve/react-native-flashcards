import { Card, Rating } from '../types';

/**
 * SM-2 Spaced Repetition Algorithm
 * Based on SuperMemo 2 algorithm
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface ReviewResult {
  interval: number; // in days
  easeFactor: number;
  repetitions: number;
  nextReviewDate: number; // timestamp
  state: 'new' | 'learning' | 'review' | 'mastered';
}

export const calculateNextReview = (card: Card, rating: Rating): ReviewResult => {
  const now = Date.now();
  let { interval, easeFactor, repetitions } = card;

  // Ensure easeFactor is within bounds
  easeFactor = Math.max(1.3, Math.min(2.5, easeFactor));

  switch (rating) {
    case 'again':
      // Reset the card
      interval = 0;
      repetitions = 0;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      break;

    case 'hard':
      // Increase interval slightly, decrease ease factor
      interval = Math.max(1, interval * 1.2);
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      repetitions += 1;
      break;

    case 'good':
      // Standard progression
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 3;
      } else {
        interval = interval * easeFactor;
      }
      repetitions += 1;
      break;

    case 'easy':
      // Faster progression, increase ease factor
      if (repetitions === 0) {
        interval = 3;
      } else if (repetitions === 1) {
        interval = 7;
      } else {
        interval = interval * easeFactor * 1.3;
      }
      easeFactor = Math.min(2.5, easeFactor + 0.15);
      repetitions += 1;
      break;
  }

  // Round interval to nearest day
  interval = Math.round(interval * 10) / 10;

  // Calculate next review date
  const nextReviewDate = now + (interval * MS_PER_DAY);

  // Determine card state
  let state: 'new' | 'learning' | 'review' | 'mastered';
  if (rating === 'again' || repetitions === 0) {
    state = 'new';
  } else if (interval < 7) {
    state = 'learning';
  } else if (interval < 30) {
    state = 'review';
  } else {
    state = 'mastered';
  }

  return {
    interval,
    easeFactor,
    repetitions,
    nextReviewDate,
    state,
  };
};

/**
 * Get cards due for review
 */
export const isDue = (card: Card): boolean => {
  return card.nextReviewDate <= Date.now();
};

/**
 * Calculate retention rate based on interval
 */
export const calculateRetention = (interval: number): number => {
  // Simple exponential decay model
  // 100% at day 0, ~80% at day 30, ~60% at day 90
  return Math.max(0, 100 * Math.exp(-interval / 60));
};

/**
 * Suggest optimal study time based on due cards
 */
export const suggestStudyTime = (dueCards: number): number => {
  // Assume 10 seconds per card on average
  return Math.ceil(dueCards * 10 / 60); // in minutes
};
