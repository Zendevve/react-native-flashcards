import { Platform } from 'react-native';

// Only import SQLite on native platforms
let SQLite: any = null;
if (Platform.OS !== 'web') {
  SQLite = require('expo-sqlite');
}

const DB_NAME = 'flashcards.db';

let db: any = null;

export const getDatabase = async (): Promise<any> => {
  if (Platform.OS === 'web') {
    throw new Error('SQLite is not available on web. Use webStorage instead.');
  }
  
  if (db) return db;
  
  db = await SQLite.openDatabaseAsync(DB_NAME);
  await initializeDatabase(db);
  return db;
};

const initializeDatabase = async (database: any) => {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    -- Deck Lists table
    CREATE TABLE IF NOT EXISTS deck_lists (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      "order" INTEGER NOT NULL
    );

    -- Decks table
    CREATE TABLE IF NOT EXISTS decks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      list_id TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      last_studied INTEGER,
      settings TEXT NOT NULL,
      FOREIGN KEY (list_id) REFERENCES deck_lists(id) ON DELETE SET NULL
    );

    -- Cards table
    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      deck_id TEXT NOT NULL,
      front TEXT NOT NULL,
      back TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      state TEXT NOT NULL,
      interval REAL NOT NULL DEFAULT 0,
      ease_factor REAL NOT NULL DEFAULT 2.5,
      repetitions INTEGER NOT NULL DEFAULT 0,
      next_review_date INTEGER NOT NULL,
      last_reviewed INTEGER,
      FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
    );

    -- Study Sessions table
    CREATE TABLE IF NOT EXISTS study_sessions (
      id TEXT PRIMARY KEY,
      deck_id TEXT NOT NULL,
      start_time INTEGER NOT NULL,
      end_time INTEGER,
      cards_studied INTEGER NOT NULL DEFAULT 0,
      new_cards INTEGER NOT NULL DEFAULT 0,
      review_cards INTEGER NOT NULL DEFAULT 0,
      accuracy REAL NOT NULL DEFAULT 0,
      ratings TEXT NOT NULL,
      FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
    );

    -- Presets table
    CREATE TABLE IF NOT EXISTS presets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      settings TEXT NOT NULL
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_cards_deck_id ON cards(deck_id);
    CREATE INDEX IF NOT EXISTS idx_cards_next_review ON cards(next_review_date);
    CREATE INDEX IF NOT EXISTS idx_cards_state ON cards(state);
    CREATE INDEX IF NOT EXISTS idx_sessions_deck_id ON study_sessions(deck_id);
    CREATE INDEX IF NOT EXISTS idx_decks_list_id ON decks(list_id);
  `);
};

export const resetDatabase = async () => {
  const database = await getDatabase();
  await database.execAsync(`
    DROP TABLE IF EXISTS study_sessions;
    DROP TABLE IF EXISTS cards;
    DROP TABLE IF EXISTS decks;
    DROP TABLE IF EXISTS deck_lists;
    DROP TABLE IF EXISTS presets;
  `);
  await initializeDatabase(database);
};
