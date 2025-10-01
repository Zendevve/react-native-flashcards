import { Deck, Card, DeckSettings, DEFAULT_DECK_SETTINGS } from '../types';

// Web storage using localStorage (for MVP, can be upgraded to IndexedDB later)

const STORAGE_KEYS = {
  DECKS: 'flashcards_decks',
  CARDS: 'flashcards_cards',
};

// Helper functions
const getFromStorage = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading from storage:', error);
    return [];
  }
};

const saveToStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to storage:', error);
  }
};

// Deck operations
export const webDeckStorage = {
  getAll: (): Deck[] => {
    return getFromStorage<Deck>(STORAGE_KEYS.DECKS);
  },

  getById: (id: string): Deck | null => {
    const decks = getFromStorage<Deck>(STORAGE_KEYS.DECKS);
    return decks.find(d => d.id === id) || null;
  },

  create: (deck: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>): Deck => {
    const decks = getFromStorage<Deck>(STORAGE_KEYS.DECKS);
    const id = `deck_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    const newDeck: Deck = {
      id,
      ...deck,
      createdAt: now,
      updatedAt: now,
      settings: { ...DEFAULT_DECK_SETTINGS, ...deck.settings },
    };

    decks.push(newDeck);
    saveToStorage(STORAGE_KEYS.DECKS, decks);
    return newDeck;
  },

  update: (id: string, updates: Partial<Omit<Deck, 'id' | 'createdAt'>>): void => {
    const decks = getFromStorage<Deck>(STORAGE_KEYS.DECKS);
    const index = decks.findIndex(d => d.id === id);
    
    if (index === -1) throw new Error('Deck not found');

    decks[index] = {
      ...decks[index],
      ...updates,
      updatedAt: Date.now(),
    };

    saveToStorage(STORAGE_KEYS.DECKS, decks);
  },

  delete: (id: string): void => {
    const decks = getFromStorage<Deck>(STORAGE_KEYS.DECKS);
    const filtered = decks.filter(d => d.id !== id);
    saveToStorage(STORAGE_KEYS.DECKS, filtered);

    // Also delete associated cards
    const cards = getFromStorage<Card>(STORAGE_KEYS.CARDS);
    const filteredCards = cards.filter(c => c.deckId !== id);
    saveToStorage(STORAGE_KEYS.CARDS, filteredCards);
  },
};

// Card operations
export const webCardStorage = {
  getAll: (): Card[] => {
    return getFromStorage<Card>(STORAGE_KEYS.CARDS);
  },

  getById: (id: string): Card | null => {
    const cards = getFromStorage<Card>(STORAGE_KEYS.CARDS);
    return cards.find(c => c.id === id) || null;
  },

  getByDeckId: (deckId: string): Card[] => {
    const cards = getFromStorage<Card>(STORAGE_KEYS.CARDS);
    return cards.filter(c => c.deckId === deckId);
  },

  create: (card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Card => {
    const cards = getFromStorage<Card>(STORAGE_KEYS.CARDS);
    const id = `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    const newCard: Card = {
      id,
      ...card,
      createdAt: now,
      updatedAt: now,
    };

    cards.push(newCard);
    saveToStorage(STORAGE_KEYS.CARDS, cards);
    return newCard;
  },

  update: (id: string, updates: Partial<Omit<Card, 'id' | 'createdAt' | 'deckId'>>): void => {
    const cards = getFromStorage<Card>(STORAGE_KEYS.CARDS);
    const index = cards.findIndex(c => c.id === id);
    
    if (index === -1) throw new Error('Card not found');

    cards[index] = {
      ...cards[index],
      ...updates,
      updatedAt: Date.now(),
    };

    saveToStorage(STORAGE_KEYS.CARDS, cards);
  },

  delete: (id: string): void => {
    const cards = getFromStorage<Card>(STORAGE_KEYS.CARDS);
    const filtered = cards.filter(c => c.id !== id);
    saveToStorage(STORAGE_KEYS.CARDS, filtered);
  },

  search: (deckId: string, query: string): Card[] => {
    const cards = getFromStorage<Card>(STORAGE_KEYS.CARDS);
    const lowerQuery = query.toLowerCase();
    return cards.filter(
      c => c.deckId === deckId && 
      (c.front.toLowerCase().includes(lowerQuery) || 
       c.back.toLowerCase().includes(lowerQuery))
    );
  },

  getDueCards: (deckId: string, limit?: number): Card[] => {
    const cards = getFromStorage<Card>(STORAGE_KEYS.CARDS);
    const now = Date.now();
    let dueCards = cards.filter(c => c.deckId === deckId && c.nextReviewDate <= now);
    
    if (limit) {
      dueCards = dueCards.slice(0, limit);
    }
    
    return dueCards;
  },

  getNewCards: (deckId: string, limit?: number): Card[] => {
    const cards = getFromStorage<Card>(STORAGE_KEYS.CARDS);
    let newCards = cards.filter(c => c.deckId === deckId && c.state === 'new');
    
    if (limit) {
      newCards = newCards.slice(0, limit);
    }
    
    return newCards;
  },
};
