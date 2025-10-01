import { Platform } from 'react-native';
import { getDatabase } from './db';
import { webCardStorage } from './webStorage';
import { Card, CardState } from '../types';

const isWeb = Platform.OS === 'web';

export const cardRepository = {
  async create(card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>): Promise<Card> {
    if (isWeb) {
      return webCardStorage.create(card);
    }

    const db = await getDatabase();
    const id = `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    const newCard: Card = {
      id,
      ...card,
      createdAt: now,
      updatedAt: now,
      state: card.state || 'new',
      interval: card.interval || 0,
      easeFactor: card.easeFactor || 2.5,
      repetitions: card.repetitions || 0,
      nextReviewDate: card.nextReviewDate || now,
      lastReviewed: card.lastReviewed || null,
    };

    await db.runAsync(
      `INSERT INTO cards (id, deck_id, front, back, created_at, updated_at, state, interval, ease_factor, repetitions, next_review_date, last_reviewed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newCard.id,
        newCard.deckId,
        newCard.front,
        newCard.back,
        newCard.createdAt,
        newCard.updatedAt,
        newCard.state,
        newCard.interval,
        newCard.easeFactor,
        newCard.repetitions,
        newCard.nextReviewDate,
        newCard.lastReviewed,
      ]
    );

    return newCard;
  },

  async getById(id: string): Promise<Card | null> {
    if (isWeb) {
      return webCardStorage.getById(id);
    }

    const db = await getDatabase();
    const row = await db.getFirstAsync<any>(
      'SELECT * FROM cards WHERE id = ?',
      [id]
    );

    if (!row) return null;

    return this.mapRowToCard(row);
  },

  async getByDeckId(deckId: string): Promise<Card[]> {
    if (isWeb) {
      return webCardStorage.getByDeckId(deckId);
    }

    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM cards WHERE deck_id = ? ORDER BY created_at DESC',
      [deckId]
    );

    return rows.map(row => this.mapRowToCard(row));
  },

  async getDueCards(deckId: string, limit?: number): Promise<Card[]> {
    if (isWeb) {
      return webCardStorage.getDueCards(deckId, limit);
    }

    const db = await getDatabase();
    const now = Date.now();
    
    let query = 'SELECT * FROM cards WHERE deck_id = ? AND next_review_date <= ? ORDER BY next_review_date ASC';
    const params: any[] = [deckId, now];
    
    if (limit) {
      query += ' LIMIT ?';
      params.push(limit);
    }

    const rows = await db.getAllAsync<any>(query, params);
    return rows.map(row => this.mapRowToCard(row));
  },

  async getNewCards(deckId: string, limit?: number): Promise<Card[]> {
    if (isWeb) {
      return webCardStorage.getNewCards(deckId, limit);
    }

    const db = await getDatabase();
    
    let query = 'SELECT * FROM cards WHERE deck_id = ? AND state = ? ORDER BY created_at ASC';
    const params: any[] = [deckId, 'new'];
    
    if (limit) {
      query += ' LIMIT ?';
      params.push(limit);
    }

    const rows = await db.getAllAsync<any>(query, params);
    return rows.map(row => this.mapRowToCard(row));
  },

  async update(id: string, updates: Partial<Omit<Card, 'id' | 'createdAt' | 'deckId'>>): Promise<void> {
    if (isWeb) {
      webCardStorage.update(id, updates);
      return;
    }

    const db = await getDatabase();
    const card = await this.getById(id);
    if (!card) throw new Error('Card not found');

    const updatedCard = {
      ...card,
      ...updates,
      updatedAt: Date.now(),
    };

    await db.runAsync(
      `UPDATE cards 
       SET front = ?, back = ?, updated_at = ?, state = ?, interval = ?, ease_factor = ?, 
           repetitions = ?, next_review_date = ?, last_reviewed = ?
       WHERE id = ?`,
      [
        updatedCard.front,
        updatedCard.back,
        updatedCard.updatedAt,
        updatedCard.state,
        updatedCard.interval,
        updatedCard.easeFactor,
        updatedCard.repetitions,
        updatedCard.nextReviewDate,
        updatedCard.lastReviewed,
        id,
      ]
    );
  },

  async delete(id: string): Promise<void> {
    if (isWeb) {
      webCardStorage.delete(id);
      return;
    }

    const db = await getDatabase();
    await db.runAsync('DELETE FROM cards WHERE id = ?', [id]);
  },

  async bulkCreate(cards: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Card[]> {
    const createdCards: Card[] = [];
    
    for (const card of cards) {
      const created = await this.create(card);
      createdCards.push(created);
    }
    
    return createdCards;
  },

  async search(deckId: string, query: string): Promise<Card[]> {
    if (isWeb) {
      return webCardStorage.search(deckId, query);
    }

    const db = await getDatabase();
    const searchTerm = `%${query}%`;
    
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM cards WHERE deck_id = ? AND (front LIKE ? OR back LIKE ?) ORDER BY created_at DESC',
      [deckId, searchTerm, searchTerm]
    );

    return rows.map(row => this.mapRowToCard(row));
  },

  mapRowToCard(row: any): Card {
    return {
      id: row.id,
      deckId: row.deck_id,
      front: row.front,
      back: row.back,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      state: row.state as CardState,
      interval: row.interval,
      easeFactor: row.ease_factor,
      repetitions: row.repetitions,
      nextReviewDate: row.next_review_date,
      lastReviewed: row.last_reviewed,
    };
  },
};
