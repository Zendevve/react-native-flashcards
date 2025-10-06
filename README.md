# FlashCards Pro - Spaced Repetition Learning App

A cross-platform flashcard application built with React Native and Expo, featuring intelligent spaced repetition, multiple study modes, and comprehensive deck management.

## Features Implemented (Phase 1)

### Core Functionality
- ✅ **Deck Management**: Create, edit, delete, and organize flashcard decks
- ✅ **Card Management**: Full CRUD operations for flashcards
- ✅ **Spaced Repetition**: SM-2 algorithm for optimal learning intervals
- ✅ **Study Sessions**: Interactive study mode with card flipping
- ✅ **Progress Tracking**: Real-time statistics and session summaries
- ✅ **Search**: Find decks and cards quickly
- ✅ **SQLite Database**: Local data persistence

### User Interface
- Clean, modern Material Design-inspired UI
- Smooth animations (card flip, progress bars)
- Intuitive navigation with bottom tabs
- Responsive layouts for web and mobile
- Empty states and loading indicators

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **State Management**: Zustand
- **Database**: SQLite (expo-sqlite)
- **UI Components**: React Native core components
- **Icons**: @expo/vector-icons (Ionicons)
- **Language**: TypeScript

## Project Structure

```
src/
├── database/
│   ├── db.ts                 # Database initialization
│   ├── deckRepository.ts     # Deck CRUD operations
│   └── cardRepository.ts     # Card CRUD operations
├── navigation/
│   └── AppNavigator.tsx      # Navigation setup
├── screens/
│   ├── HomeScreen.tsx        # Deck list and creation
│   ├── DeckDetailScreen.tsx  # Deck statistics and actions
│   ├── CardListScreen.tsx    # Card management
│   ├── StudyScreen.tsx       # Study session interface
│   └── SettingsScreen.tsx    # App settings
├── store/
│   └── useStore.ts           # Zustand state management
├── types/
│   └── index.ts              # TypeScript type definitions
└── utils/
    └── spacedRepetition.ts   # SM-2 algorithm implementation
```

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Expo CLI (installed automatically)

### Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Start the development server**:
```bash
npm start
```

3. **Run on specific platform**:
```bash
# Web browser
npm run web

# Android (requires Android Studio or physical device)
npm run android

# iOS (requires macOS and Xcode)
npm run ios
```

## Usage Guide

### Creating Your First Deck

1. Launch the app and tap the **+** button on the home screen
2. Enter a deck name and optional description
3. Tap **Create**

### Adding Cards

1. Open a deck from the home screen
2. Tap **View All Cards**
3. Tap the **+** button
4. Enter the question (front) and answer (back)
5. Tap **Save**

### Studying

1. From the deck detail screen, tap **Start Study Session**
2. Read the question and tap the card to reveal the answer
3. Rate your recall:
   - **Again**: Didn't remember (resets interval)
   - **Hard**: Difficult to remember (slight increase)
   - **Good**: Remembered correctly (standard progression)
   - **Easy**: Very easy to remember (faster progression)
4. Complete the session to see your statistics

## Spaced Repetition Algorithm

The app uses the **SuperMemo 2 (SM-2)** algorithm:

- **New cards**: Start with 1-day interval
- **Rating adjustments**:
  - Again: Reset to 1 day
  - Hard: Interval × 1.2
  - Good: Interval × ease factor (default 2.5)
  - Easy: Interval × ease factor × 1.3
- **Card states**: New → Learning → Review → Mastered
- **Ease factor**: Adjusts between 1.3 and 2.5 based on performance

## Database Schema

### Tables
- **decks**: Deck metadata and settings
- **cards**: Flashcard content and SRS data
- **study_sessions**: Historical session data
- **deck_lists**: Deck organization (future feature)
- **presets**: Saved settings templates (future feature)

## Roadmap

### Phase 2 (Next Steps)
- [ ] Custom interval schemes per deck
- [ ] Multiple study modes (multiple choice, typing)
- [ ] Text-to-Speech (TTS) integration
- [ ] Hints and question hiding
- [ ] Card inversion (swap front/back)
- [ ] Import/Export CSV functionality

### Phase 3 (Advanced Features)
- [ ] Pre-made deck catalog
- [ ] Walking mode (hands-free)
- [ ] Autoplay mode
- [ ] Dark theme
- [ ] Cloud backup
- [ ] Settings presets

### Phase 4 (Polish)
- [ ] Advanced statistics dashboard
- [ ] Daily reminders
- [ ] Streak tracking
- [ ] Performance optimization
- [ ] Accessibility improvements

## Development

### Running Tests
```bash
# Coming soon
npm test
```

### Building for Production

**Mobile (Android/iOS)**:
```bash
# Android APK for testing
npx eas-cli build --platform android --profile preview

# Production builds
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
```

**Web (GitHub Pages)**:
```bash
# Note: Requires web-compatible storage implementation
# See WEB_DEPLOYMENT_STATUS.md for details
npm run build:web
npm run deploy
```

**Deployment Guides:**
- 📱 Mobile: See `DEPLOYMENT_SUMMARY.md`
- 🌐 Web: See `WEB_DEPLOYMENT_STATUS.md` and `GITHUB_PAGES_DEPLOYMENT.md`

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

MIT License - feel free to use this code for your own projects.

## Acknowledgments

- SuperMemo SM-2 algorithm
- React Native and Expo teams
- Open source community
