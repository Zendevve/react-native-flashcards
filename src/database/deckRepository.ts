import { Platform } from 'react-native';
import { getDatabase } from './db';
import { webDeckStorage, webCardStorage } from './webStorage';
import { Deck, DeckSettings, DeckStats, DEFAULT_DECK_SETTINGS } from '../types';

const isWeb = Platform.OS === 'web';

export const deckRepository = {
  async create(deck: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deck> {
    if (isWeb) {
      return webDeckStorage.create(deck);
    }

    const db = await getDatabase();
    const id = `deck_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    
    const newDeck: Deck = {
      id,
      ...deck,
      createdAt: now,
      updatedAt: now,
      settings: { ...DEFAULT_DECK_SETTINGS, ...deck.settings },
    };

    await db.runAsync(
      `INSERT INTO decks (id, name, description, category, list_id, created_at, updated_at, last_studied, settings)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newDeck.id,
        newDeck.name,
        newDeck.description,
        newDeck.category,
        newDeck.listId,
        newDeck.createdAt,
        newDeck.updatedAt,
        newDeck.lastStudied,
        JSON.stringify(newDeck.settings),
      ]
    );

    return newDeck;
  },

  async getById(id: string): Promise<Deck | null> {
    if (isWeb) {
      return webDeckStorage.getById(id);
    }

    const db = await getDatabase();
    const row = await db.getFirstAsync<any>(
      'SELECT * FROM decks WHERE id = ?',
      [id]
    );

    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      listId: row.list_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastStudied: row.last_studied,
      settings: JSON.parse(row.settings),
    };
  },

  async getAll(): Promise<Deck[]> {
    if (isWeb) {
      return webDeckStorage.getAll();
    }

    const db = await getDatabase();
    const rows = await db.getAllAsync<any>('SELECT * FROM decks ORDER BY updated_at DESC');

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      listId: row.list_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastStudied: row.last_studied,
      settings: JSON.parse(row.settings),
    }));
  },

  async update(id: string, updates: Partial<Omit<Deck, 'id' | 'createdAt'>>): Promise<void> {
    if (isWeb) {
      webDeckStorage.update(id, updates);
      return;
    }

    const db = await getDatabase();
    const deck = await this.getById(id);
    if (!deck) throw new Error('Deck not found');

    const updatedDeck = {
      ...deck,
      ...updates,
      updatedAt: Date.now(),
    };

    await db.runAsync(
      `UPDATE decks 
       SET name = ?, description = ?, category = ?, list_id = ?, updated_at = ?, last_studied = ?, settings = ?
       WHERE id = ?`,
      [
        updatedDeck.name,
        updatedDeck.description,
        updatedDeck.category,
        updatedDeck.listId,
        updatedDeck.updatedAt,
        updatedDeck.lastStudied,
        JSON.stringify(updatedDeck.settings),
        id,
      ]
    );
  },

  async delete(id: string): Promise<void> {
    if (isWeb) {
      webDeckStorage.delete(id);
      return;
    }

    const db = await getDatabase();
    await db.runAsync('DELETE FROM decks WHERE id = ?', [id]);
  },

  async getStats(deckId: string): Promise<DeckStats> {
    if (isWeb) {
      const cards = webCardStorage.getByDeckId(deckId);
      const now = Date.now();
      
      return {
        totalCards: cards.length,
        newCards: cards.filter(c => c.state === 'new').length,
        learningCards: cards.filter(c => c.state === 'learning').length,
        reviewCards: cards.filter(c => c.state === 'review').length,
        masteredCards: cards.filter(c => c.state === 'mastered').length,
        dueCards: cards.filter(c => c.nextReviewDate <= now).length,
      };
    }

    const db = await getDatabase();
    const now = Date.now();

    const stats = await db.getFirstAsync<any>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN state = 'new' THEN 1 ELSE 0 END) as new,
        SUM(CASE WHEN state = 'learning' THEN 1 ELSE 0 END) as learning,
        SUM(CASE WHEN state = 'review' THEN 1 ELSE 0 END) as review,
        SUM(CASE WHEN state = 'mastered' THEN 1 ELSE 0 END) as mastered,
        SUM(CASE WHEN next_review_date <= ? THEN 1 ELSE 0 END) as due
       FROM cards WHERE deck_id = ?`,
      [now, deckId]
    );

    return {
      totalCards: stats?.total || 0,
      newCards: stats?.new || 0,
      learningCards: stats?.learning || 0,
      reviewCards: stats?.review || 0,
      masteredCards: stats?.mastered || 0,
      dueCards: stats?.due || 0,
    };
  },

  async updateSettings(deckId: string, settings: Partial<DeckSettings>): Promise<void> {
    const deck = await this.getById(deckId);
    if (!deck) throw new Error('Deck not found');

    const updatedSettings = { ...deck.settings, ...settings };
    await this.update(deckId, { settings: updatedSettings });
  },
};
