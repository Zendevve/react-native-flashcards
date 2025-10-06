import { Deck, Card, DeckSettings, DEFAULT_DECK_SETTINGS } from '../types';

// Sample decks for web demo
export const MOCK_DECKS: Deck[] = [
  {
    id: 'deck-1',
    name: 'Spanish Vocabulary',
    description: 'Essential Spanish words and phrases for beginners',
    category: 'Languages',
    listId: null,
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
    updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
    lastStudied: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
    settings: {
      ...DEFAULT_DECK_SETTINGS,
      questionLanguage: 'en-US',
      answerLanguage: 'es-ES',
    },
  },
  {
    id: 'deck-2',
    name: 'JavaScript Fundamentals',
    description: 'Core JavaScript concepts and syntax',
    category: 'Programming',
    listId: null,
    createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000, // 14 days ago
    updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
    lastStudied: Date.now() - 5 * 60 * 60 * 1000, // 5 hours ago
    settings: DEFAULT_DECK_SETTINGS,
  },
  {
    id: 'deck-3',
    name: 'World Capitals',
    description: 'Capital cities of countries around the world',
    category: 'Geography',
    listId: null,
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    updatedAt: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago
    lastStudied: null,
    settings: DEFAULT_DECK_SETTINGS,
  },
];

// Sample cards for Spanish deck
const spanishCards: Card[] = [
  {
    id: 'card-1-1',
    deckId: 'deck-1',
    front: 'Hello',
    back: 'Hola',
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    state: 'review',
    interval: 7,
    easeFactor: 2.5,
    repetitions: 3,
    nextReviewDate: Date.now() + 1 * 24 * 60 * 60 * 1000,
    lastReviewed: Date.now() - 2 * 60 * 60 * 1000,
  },
  {
    id: 'card-1-2',
    deckId: 'deck-1',
    front: 'Goodbye',
    back: 'Adiós',
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    state: 'review',
    interval: 3,
    easeFactor: 2.3,
    repetitions: 2,
    nextReviewDate: Date.now() - 1 * 24 * 60 * 60 * 1000, // Due yesterday
    lastReviewed: Date.now() - 4 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'card-1-3',
    deckId: 'deck-1',
    front: 'Thank you',
    back: 'Gracias',
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    state: 'mastered',
    interval: 30,
    easeFactor: 2.8,
    repetitions: 5,
    nextReviewDate: Date.now() + 15 * 24 * 60 * 60 * 1000,
    lastReviewed: Date.now() - 15 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'card-1-4',
    deckId: 'deck-1',
    front: 'Please',
    back: 'Por favor',
    createdAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
    state: 'learning',
    interval: 1,
    easeFactor: 2.5,
    repetitions: 1,
    nextReviewDate: Date.now(),
    lastReviewed: Date.now() - 1 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'card-1-5',
    deckId: 'deck-1',
    front: 'Yes',
    back: 'Sí',
    createdAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
    state: 'new',
    interval: 0,
    easeFactor: 2.5,
    repetitions: 0,
    nextReviewDate: Date.now(),
    lastReviewed: null,
  },
  {
    id: 'card-1-6',
    deckId: 'deck-1',
    front: 'No',
    back: 'No',
    createdAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
    state: 'new',
    interval: 0,
    easeFactor: 2.5,
    repetitions: 0,
    nextReviewDate: Date.now(),
    lastReviewed: null,
  },
];

// Sample cards for JavaScript deck
const jsCards: Card[] = [
  {
    id: 'card-2-1',
    deckId: 'deck-2',
    front: 'What does "const" keyword do in JavaScript?',
    back: 'Declares a block-scoped constant variable that cannot be reassigned',
    createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
    state: 'review',
    interval: 14,
    easeFactor: 2.6,
    repetitions: 4,
    nextReviewDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
    lastReviewed: Date.now() - 7 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'card-2-2',
    deckId: 'deck-2',
    front: 'What is a closure in JavaScript?',
    back: 'A function that has access to variables in its outer (enclosing) lexical scope, even after the outer function has returned',
    createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
    state: 'review',
    interval: 7,
    easeFactor: 2.4,
    repetitions: 3,
    nextReviewDate: Date.now(),
    lastReviewed: Date.now() - 7 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'card-2-3',
    deckId: 'deck-2',
    front: 'What is the difference between "==" and "===" in JavaScript?',
    back: '"==" checks for value equality with type coercion, "===" checks for value and type equality without coercion',
    createdAt: Date.now() - 13 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 13 * 24 * 60 * 60 * 1000,
    state: 'learning',
    interval: 3,
    easeFactor: 2.5,
    repetitions: 2,
    nextReviewDate: Date.now() + 1 * 24 * 60 * 60 * 1000,
    lastReviewed: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'card-2-4',
    deckId: 'deck-2',
    front: 'What is the purpose of "async/await" in JavaScript?',
    back: 'To write asynchronous code that looks and behaves like synchronous code, making it easier to read and maintain',
    createdAt: Date.now() - 12 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 12 * 24 * 60 * 60 * 1000,
    state: 'new',
    interval: 0,
    easeFactor: 2.5,
    repetitions: 0,
    nextReviewDate: Date.now(),
    lastReviewed: null,
  },
  {
    id: 'card-2-5',
    deckId: 'deck-2',
    front: 'What is the "this" keyword in JavaScript?',
    back: 'A reference to the object that is executing the current function. Its value depends on how the function is called',
    createdAt: Date.now() - 12 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 12 * 24 * 60 * 60 * 1000,
    state: 'new',
    interval: 0,
    easeFactor: 2.5,
    repetitions: 0,
    nextReviewDate: Date.now(),
    lastReviewed: null,
  },
];

// Sample cards for World Capitals deck
const capitalCards: Card[] = [
  {
    id: 'card-3-1',
    deckId: 'deck-3',
    front: 'What is the capital of France?',
    back: 'Paris',
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    state: 'new',
    interval: 0,
    easeFactor: 2.5,
    repetitions: 0,
    nextReviewDate: Date.now(),
    lastReviewed: null,
  },
  {
    id: 'card-3-2',
    deckId: 'deck-3',
    front: 'What is the capital of Japan?',
    back: 'Tokyo',
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    state: 'new',
    interval: 0,
    easeFactor: 2.5,
    repetitions: 0,
    nextReviewDate: Date.now(),
    lastReviewed: null,
  },
  {
    id: 'card-3-3',
    deckId: 'deck-3',
    front: 'What is the capital of Brazil?',
    back: 'Brasília',
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    state: 'new',
    interval: 0,
    easeFactor: 2.5,
    repetitions: 0,
    nextReviewDate: Date.now(),
    lastReviewed: null,
  },
  {
    id: 'card-3-4',
    deckId: 'deck-3',
    front: 'What is the capital of Australia?',
    back: 'Canberra',
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    state: 'new',
    interval: 0,
    easeFactor: 2.5,
    repetitions: 0,
    nextReviewDate: Date.now(),
    lastReviewed: null,
  },
  {
    id: 'card-3-5',
    deckId: 'deck-3',
    front: 'What is the capital of Egypt?',
    back: 'Cairo',
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    state: 'new',
    interval: 0,
    easeFactor: 2.5,
    repetitions: 0,
    nextReviewDate: Date.now(),
    lastReviewed: null,
  },
];

// Combine all cards
export const MOCK_CARDS: Card[] = [...spanishCards, ...jsCards, ...capitalCards];

// Helper function to get cards by deck ID
export const getCardsByDeckId = (deckId: string): Card[] => {
  return MOCK_CARDS.filter(card => card.deckId === deckId);
};

// Helper function to get deck by ID
export const getDeckById = (deckId: string): Deck | undefined => {
  return MOCK_DECKS.find(deck => deck.id === deckId);
};
