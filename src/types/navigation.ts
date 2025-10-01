// Navigation type definitions

export type RootStackParamList = {
  MainTabs: undefined;
  DeckDetail: { deckId: string };
  CardList: { deckId: string };
  Study: { deckId: string };
  DeckSettings: { deckId: string };
};

export type TabParamList = {
  Home: undefined;
  Settings: undefined;
};
