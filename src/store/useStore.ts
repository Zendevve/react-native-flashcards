import { create } from 'zustand';
import { Deck, Card, DeckStats, DeckSettings } from '../types';
import { deckRepository } from '../database/deckRepository';
import { cardRepository } from '../database/cardRepository';

interface AppState {
  // Decks
  decks: Deck[];
  currentDeck: Deck | null;
  deckStats: Record<string, DeckStats>;
  
  // Cards
  cards: Card[];
  currentCard: Card | null;
  
  // Study session
  studyCards: Card[];
  currentCardIndex: number;
  sessionStats: {
    cardsStudied: number;
    ratings: { again: number; hard: number; good: number; easy: number };
  };
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Actions - Decks
  loadDecks: () => Promise<void>;
  loadDeck: (id: string) => Promise<void>;
  createDeck: (deck: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Deck>;
  updateDeck: (id: string, updates: Partial<Omit<Deck, 'id' | 'createdAt'>>) => Promise<void>;
  deleteDeck: (id: string) => Promise<void>;
  updateDeckSettings: (deckId: string, settings: Partial<DeckSettings>) => Promise<void>;
  loadDeckStats: (deckId: string) => Promise<void>;
  
  // Actions - Cards
  loadCards: (deckId: string) => Promise<void>;
  createCard: (card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Card>;
  updateCard: (id: string, updates: Partial<Omit<Card, 'id' | 'createdAt' | 'deckId'>>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  searchCards: (deckId: string, query: string) => Promise<void>;
  
  // Actions - Study
  startStudySession: (deckId: string) => Promise<void>;
  nextCard: () => void;
  previousCard: () => void;
  resetSession: () => void;
  
  // Utility
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  decks: [],
  currentDeck: null,
  deckStats: {},
  cards: [],
  currentCard: null,
  studyCards: [],
  currentCardIndex: 0,
  sessionStats: {
    cardsStudied: 0,
    ratings: { again: 0, hard: 0, good: 0, easy: 0 },
  },
  isLoading: false,
  error: null,

  // Deck actions
  loadDecks: async () => {
    set({ isLoading: true, error: null });
    try {
      const decks = await deckRepository.getAll();
      set({ decks, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  loadDeck: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const deck = await deckRepository.getById(id);
      set({ currentDeck: deck, isLoading: false });
      if (deck) {
        await get().loadDeckStats(id);
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createDeck: async (deck) => {
    set({ isLoading: true, error: null });
    try {
      const newDeck = await deckRepository.create(deck);
      set((state) => ({
        decks: [newDeck, ...state.decks],
        isLoading: false,
      }));
      return newDeck;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updateDeck: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      await deckRepository.update(id, updates);
      const updatedDeck = await deckRepository.getById(id);
      set((state) => ({
        decks: state.decks.map((d) => (d.id === id ? updatedDeck! : d)),
        currentDeck: state.currentDeck?.id === id ? updatedDeck : state.currentDeck,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteDeck: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deckRepository.delete(id);
      set((state) => ({
        decks: state.decks.filter((d) => d.id !== id),
        currentDeck: state.currentDeck?.id === id ? null : state.currentDeck,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateDeckSettings: async (deckId, settings) => {
    set({ isLoading: true, error: null });
    try {
      await deckRepository.updateSettings(deckId, settings);
      const updatedDeck = await deckRepository.getById(deckId);
      set((state) => ({
        decks: state.decks.map((d) => (d.id === deckId ? updatedDeck! : d)),
        currentDeck: state.currentDeck?.id === deckId ? updatedDeck : state.currentDeck,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  loadDeckStats: async (deckId) => {
    try {
      const stats = await deckRepository.getStats(deckId);
      set((state) => ({
        deckStats: { ...state.deckStats, [deckId]: stats },
      }));
    } catch (error) {
      console.error('Failed to load deck stats:', error);
    }
  },

  // Card actions
  loadCards: async (deckId) => {
    set({ isLoading: true, error: null });
    try {
      const cards = await cardRepository.getByDeckId(deckId);
      set({ cards, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createCard: async (card) => {
    set({ isLoading: true, error: null });
    try {
      const newCard = await cardRepository.create(card);
      set((state) => ({
        cards: [newCard, ...state.cards],
        isLoading: false,
      }));
      await get().loadDeckStats(card.deckId);
      return newCard;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updateCard: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      await cardRepository.update(id, updates);
      const updatedCard = await cardRepository.getById(id);
      set((state) => ({
        cards: state.cards.map((c) => (c.id === id ? updatedCard! : c)),
        currentCard: state.currentCard?.id === id ? updatedCard : state.currentCard,
        isLoading: false,
      }));
      if (updatedCard) {
        await get().loadDeckStats(updatedCard.deckId);
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteCard: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const card = await cardRepository.getById(id);
      await cardRepository.delete(id);
      set((state) => ({
        cards: state.cards.filter((c) => c.id !== id),
        isLoading: false,
      }));
      if (card) {
        await get().loadDeckStats(card.deckId);
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  searchCards: async (deckId, query) => {
    set({ isLoading: true, error: null });
    try {
      const cards = await cardRepository.search(deckId, query);
      set({ cards, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Study session actions
  startStudySession: async (deckId) => {
    set({ isLoading: true, error: null });
    try {
      const deck = await deckRepository.getById(deckId);
      if (!deck) throw new Error('Deck not found');

      // Get due cards and new cards based on deck settings
      const dueCards = await cardRepository.getDueCards(deckId);
      const newCards = await cardRepository.getNewCards(
        deckId,
        deck.settings.newCardsPerDay
      );

      // Combine and limit based on settings
      let studyCards = [
        ...dueCards.slice(0, deck.settings.reviewCardsPerDay),
        ...newCards,
      ];

      // Shuffle if enabled
      if (deck.settings.shuffleCards) {
        studyCards = studyCards.sort(() => Math.random() - 0.5);
      }

      set({
        studyCards,
        currentCardIndex: 0,
        currentCard: studyCards[0] || null,
        sessionStats: {
          cardsStudied: 0,
          ratings: { again: 0, hard: 0, good: 0, easy: 0 },
        },
        isLoading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  nextCard: () => {
    set((state) => {
      const nextIndex = state.currentCardIndex + 1;
      if (nextIndex >= state.studyCards.length) {
        return { currentCard: null }; // Session complete
      }
      return {
        currentCardIndex: nextIndex,
        currentCard: state.studyCards[nextIndex],
      };
    });
  },

  previousCard: () => {
    set((state) => {
      const prevIndex = Math.max(0, state.currentCardIndex - 1);
      return {
        currentCardIndex: prevIndex,
        currentCard: state.studyCards[prevIndex],
      };
    });
  },

  resetSession: () => {
    set({
      studyCards: [],
      currentCardIndex: 0,
      currentCard: null,
      sessionStats: {
        cardsStudied: 0,
        ratings: { again: 0, hard: 0, good: 0, easy: 0 },
      },
    });
  },

  // Utility
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
