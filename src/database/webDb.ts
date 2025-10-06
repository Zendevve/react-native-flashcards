// Web-compatible database layer using mock data
// This provides the same interface as the SQLite database but uses in-memory data

import { MOCK_DECKS, MOCK_CARDS, getCardsByDeckId, getDeckById } from './mockData';
import { Deck, Card } from '../types';

// In-memory storage for web demo
let decks = [...MOCK_DECKS];
let cards = [...MOCK_CARDS];

// Mock database object that mimics SQLite interface
export const webDatabase = {
  // Deck operations
  getAllDecks: async (): Promise<Deck[]> => {
    return [...decks];
  },

  getDeckById: async (id: string): Promise<Deck | undefined> => {
    return decks.find(deck => deck.id === id);
  },

  createDeck: async (deck: Deck): Promise<void> => {
    // In demo mode, we don't actually create decks
    console.log('Demo mode: Deck creation disabled');
  },

  updateDeck: async (deck: Deck): Promise<void> => {
    const index = decks.findIndex(d => d.id === deck.id);
    if (index !== -1) {
      decks[index] = { ...deck, updatedAt: Date.now() };
    }
  },

  deleteDeck: async (id: string): Promise<void> => {
    // In demo mode, we don't actually delete decks
    console.log('Demo mode: Deck deletion disabled');
  },

  // Card operations
  getCardsByDeckId: async (deckId: string): Promise<Card[]> => {
    return cards.filter(card => card.deckId === deckId);
  },

  getCardById: async (id: string): Promise<Card | undefined> => {
    return cards.find(card => card.id === id);
  },

  createCard: async (card: Card): Promise<void> => {
    // In demo mode, we don't actually create cards
    console.log('Demo mode: Card creation disabled');
  },

  updateCard: async (card: Card): Promise<void> => {
    const index = cards.findIndex(c => c.id === card.id);
    if (index !== -1) {
      cards[index] = { ...card, updatedAt: Date.now() };
    }
  },

  deleteCard: async (id: string): Promise<void> => {
    // In demo mode, we don't actually delete cards
    console.log('Demo mode: Card deletion disabled');
  },

  // Study session operations
  getDueCards: async (deckId: string): Promise<Card[]> => {
    const now = Date.now();
    return cards.filter(
      card => card.deckId === deckId && card.nextReviewDate <= now
    );
  },

  // Stats operations
  getDeckStats: async (deckId: string) => {
    const deckCards = cards.filter(card => card.deckId === deckId);
    const now = Date.now();

    return {
      totalCards: deckCards.length,
      newCards: deckCards.filter(c => c.state === 'new').length,
      learningCards: deckCards.filter(c => c.state === 'learning').length,
      reviewCards: deckCards.filter(c => c.state === 'review').length,
      masteredCards: deckCards.filter(c => c.state === 'mastered').length,
      dueCards: deckCards.filter(c => c.nextReviewDate <= now).length,
    };
  },

  // Search operations
  searchDecks: async (query: string): Promise<Deck[]> => {
    const lowerQuery = query.toLowerCase();
    return decks.filter(
      deck =>
        deck.name.toLowerCase().includes(lowerQuery) ||
        deck.description.toLowerCase().includes(lowerQuery) ||
        deck.category.toLowerCase().includes(lowerQuery)
    );
  },

  searchCards: async (deckId: string, query: string): Promise<Card[]> => {
    const lowerQuery = query.toLowerCase();
    return cards.filter(
      card =>
        card.deckId === deckId &&
        (card.front.toLowerCase().includes(lowerQuery) ||
          card.back.toLowerCase().includes(lowerQuery))
    );
  },
};

// Initialize function (no-op for web, but keeps interface consistent)
export const initializeWebDatabase = async () => {
  console.log('Web demo mode: Using mock data');
  return webDatabase;
};

// Export a function that returns the database (matches SQLite interface)
export const getWebDatabase = async () => {
  return webDatabase;
};
