// Core data types for the flashcard application

export type CardState = 'new' | 'learning' | 'review' | 'mastered';
export type StudyMode = 'flashcard' | 'multiple-choice' | 'typing';

export interface Deck {
  id: string;
  name: string;
  description: string;
  category: string;
  listId: string | null;
  createdAt: number;
  updatedAt: number;
  lastStudied: number | null;
  settings: DeckSettings;
}

export interface DeckSettings {
  intervalScheme: string; // 'standard', 'aggressive', 'relaxed', or 'custom'
  customIntervals: number[]; // in days
  newCardsPerDay: number;
  reviewCardsPerDay: number;
  questionLanguage: string;
  answerLanguage: string;
  autoSpeakQuestion: boolean;
  autoSpeakAnswer: boolean;
  enableHints: boolean;
  hintMaskingLevel: number; // 25, 50, 75
  enableTimer: boolean;
  timerDuration: number; // seconds
  cardInverted: boolean;
  studyMode: StudyMode; // 'flashcard', 'multiple-choice', 'typing'
  shuffleCards: boolean; // randomize card order
}

export interface Card {
  id: string;
  deckId: string;
  front: string;
  back: string;
  createdAt: number;
  updatedAt: number;
  state: CardState;
  interval: number; // days
  easeFactor: number; // SM-2 algorithm
  repetitions: number;
  nextReviewDate: number;
  lastReviewed: number | null;
}

export interface StudySession {
  id: string;
  deckId: string;
  startTime: number;
  endTime: number | null;
  cardsStudied: number;
  newCards: number;
  reviewCards: number;
  accuracy: number;
  ratings: {
    again: number;
    hard: number;
    good: number;
    easy: number;
  };
}

export interface DeckList {
  id: string;
  name: string;
  color: string;
  order: number;
}

export interface Preset {
  id: string;
  name: string;
  settings: DeckSettings;
}

export interface DeckStats {
  totalCards: number;
  newCards: number;
  learningCards: number;
  reviewCards: number;
  masteredCards: number;
  dueCards: number;
}

export type Rating = 'again' | 'hard' | 'good' | 'easy';

export const INTERVAL_PRESETS: Record<string, number[]> = {
  aggressive: [1, 2, 4, 8, 15, 30, 60],
  standard: [1, 3, 7, 14, 30, 60, 90],
  relaxed: [1, 4, 10, 20, 40, 80, 120],
  custom: [],
};

export const DEFAULT_DECK_SETTINGS: DeckSettings = {
  intervalScheme: 'standard',
  customIntervals: INTERVAL_PRESETS.standard,
  newCardsPerDay: 20,
  reviewCardsPerDay: 100,
  questionLanguage: 'en-US',
  answerLanguage: 'en-US',
  autoSpeakQuestion: false,
  autoSpeakAnswer: false,
  enableHints: false,
  hintMaskingLevel: 50,
  enableTimer: false,
  timerDuration: 30,
  cardInverted: false,
  studyMode: 'flashcard',
  shuffleCards: false,
};
