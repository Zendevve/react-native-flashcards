import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useStore } from '../store/useStore';
import { GeistColors, GeistSpacing, GeistFontSizes, GeistBorderRadius } from '../theme/geist';
import ImportExportModal from '../components/ImportExportModal';
import { cardRepository } from '../database/cardRepository';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DeckDetail'>;
type RouteProps = RouteProp<RootStackParamList, 'DeckDetail'>;

const DeckDetailScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { deckId } = route.params;

  const { currentDeck, deckStats, loadDeck, loadDeckStats, cards, loadCards } = useStore();
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    loadDeck(deckId);
    loadDeckStats(deckId);
    loadCards(deckId);
  }, [deckId]);

  const stats = deckStats[deckId];

  const handleImport = async (importedCards: { front: string; back: string }[]) => {
    try {
      for (const card of importedCards) {
        await cardRepository.create({
          deckId,
          front: card.front,
          back: card.back,
          state: 'new',
          interval: 0,
          easeFactor: 2.5,
          repetitions: 0,
          nextReviewDate: Date.now(),
          lastReviewed: null,
        });
      }
      
      Alert.alert('Success', `Imported ${importedCards.length} cards`);
      loadCards(deckId);
      loadDeckStats(deckId);
    } catch (error) {
      Alert.alert('Error', 'Failed to import cards');
      console.error(error);
    }
  };

  if (!currentDeck) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const handleStartStudy = () => {
    if (!stats || stats.dueCards === 0) {
      Alert.alert('No Cards Due', 'There are no cards to study right now.');
      return;
    }
    navigation.navigate('Study', { deckId });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.deckName}>{currentDeck.name}</Text>
        {currentDeck.description ? (
          <Text style={styles.deckDescription}>{currentDeck.description}</Text>
        ) : null}
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats?.totalCards || 0}</Text>
            <Text style={styles.statLabel}>Total Cards</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: '#2196f3' }]}>
              {stats?.newCards || 0}
            </Text>
            <Text style={styles.statLabel}>New</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: '#ff9800' }]}>
              {stats?.learningCards || 0}
            </Text>
            <Text style={styles.statLabel}>Learning</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: '#4caf50' }]}>
              {stats?.reviewCards || 0}
            </Text>
            <Text style={styles.statLabel}>Review</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: '#9c27b0' }]}>
              {stats?.masteredCards || 0}
            </Text>
            <Text style={styles.statLabel}>Mastered</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: '#6200ee' }]}>
              {stats?.dueCards || 0}
            </Text>
            <Text style={styles.statLabel}>Due Today</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Actions</Text>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={handleStartStudy}
        >
          <Ionicons name="school" size={20} color={GeistColors.background} />
          <Text style={styles.actionButtonText}>Start Study Session</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('CardList', { deckId })}
        >
          <Ionicons name="list" size={20} color={GeistColors.foreground} />
          <Text style={[styles.actionButtonText, { color: GeistColors.foreground }]}>
            View All Cards
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('DeckSettings', { deckId })}
        >
          <Ionicons name="settings-outline" size={20} color={GeistColors.foreground} />
          <Text style={[styles.actionButtonText, { color: GeistColors.foreground }]}>
            Deck Settings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setShowImportModal(true)}
        >
          <Ionicons name="download-outline" size={20} color={GeistColors.foreground} />
          <Text style={[styles.actionButtonText, { color: GeistColors.foreground }]}>
            Import Cards
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setShowExportModal(true)}
        >
          <Ionicons name="share-outline" size={20} color={GeistColors.foreground} />
          <Text style={[styles.actionButtonText, { color: GeistColors.foreground }]}>
            Export Deck
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.sectionTitle}>Deck Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Category:</Text>
          <Text style={styles.infoValue}>{currentDeck.category}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Created:</Text>
          <Text style={styles.infoValue}>
            {new Date(currentDeck.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Last Studied:</Text>
          <Text style={styles.infoValue}>
            {currentDeck.lastStudied
              ? new Date(currentDeck.lastStudied).toLocaleDateString()
              : 'Never'}
          </Text>
        </View>
      </View>

      <ImportExportModal
        visible={showImportModal}
        mode="import"
        deckId={deckId}
        deckName={currentDeck.name}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
      />

      <ImportExportModal
        visible={showExportModal}
        mode="export"
        deckId={deckId}
        deckName={currentDeck.name}
        cards={cards}
        onClose={() => setShowExportModal(false)}
        onImport={() => {}}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GeistColors.background,
  },
  header: {
    backgroundColor: GeistColors.background,
    padding: GeistSpacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: GeistColors.border,
  },
  deckName: {
    fontSize: GeistFontSizes.xxxl,
    fontWeight: '600',
    color: GeistColors.foreground,
    marginBottom: GeistSpacing.xs,
  },
  deckDescription: {
    fontSize: GeistFontSizes.base,
    color: GeistColors.gray600,
    lineHeight: 24,
  },
  statsContainer: {
    backgroundColor: GeistColors.background,
    margin: GeistSpacing.md,
    padding: GeistSpacing.lg,
    borderWidth: 1,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.md,
  },
  sectionTitle: {
    fontSize: GeistFontSizes.xs,
    fontWeight: '500',
    color: GeistColors.gray600,
    marginBottom: GeistSpacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: GeistSpacing.md,
  },
  statBox: {
    width: '30%',
    alignItems: 'center',
  },
  statValue: {
    fontSize: GeistFontSizes.xxl,
    fontWeight: '600',
    color: GeistColors.foreground,
  },
  statLabel: {
    fontSize: GeistFontSizes.xs,
    color: GeistColors.gray500,
    marginTop: GeistSpacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionsContainer: {
    backgroundColor: GeistColors.background,
    margin: GeistSpacing.md,
    marginTop: 0,
    padding: GeistSpacing.lg,
    borderWidth: 1,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: GeistSpacing.md,
    paddingVertical: GeistSpacing.md,
    borderRadius: GeistBorderRadius.sm,
    borderWidth: 1,
    borderColor: GeistColors.border,
    marginBottom: GeistSpacing.sm,
    minHeight: 52,
  },
  primaryButton: {
    backgroundColor: GeistColors.foreground,
    borderColor: GeistColors.foreground,
  },
  actionButtonText: {
    fontSize: GeistFontSizes.sm,
    fontWeight: '500',
    color: GeistColors.background,
    marginLeft: GeistSpacing.sm,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  infoContainer: {
    backgroundColor: GeistColors.background,
    margin: GeistSpacing.md,
    marginTop: 0,
    padding: GeistSpacing.lg,
    borderWidth: 1,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.md,
    marginBottom: GeistSpacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: GeistSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: GeistColors.border,
  },
  infoLabel: {
    fontSize: GeistFontSizes.sm,
    color: GeistColors.gray600,
  },
  infoValue: {
    fontSize: GeistFontSizes.sm,
    color: GeistColors.foreground,
    fontWeight: '500',
  },
});

export default DeckDetailScreen;
