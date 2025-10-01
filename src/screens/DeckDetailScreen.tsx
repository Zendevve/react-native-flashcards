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
import {
  GeistColors,
  GeistSpacing,
  GeistFontSizes,
  GeistBorderRadius,
  GeistBorders,
  GeistShadows,
  GeistTypography,
  GeistComponents,
} from '../theme/geist';
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
          <Ionicons name="school" size={20} color={GeistColors.foreground} />
          <Text style={styles.actionButtonText}>Start Study Session</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('CardList', { deckId })}
        >
          <Ionicons name="list" size={20} color={GeistColors.foreground} />
          <Text style={[styles.actionButtonText, styles.actionButtonTextNeutral]}>
            View All Cards
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('DeckSettings', { deckId })}
        >
          <Ionicons name="settings-outline" size={20} color={GeistColors.foreground} />
          <Text style={[styles.actionButtonText, styles.actionButtonTextNeutral]}>
            Deck Settings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setShowImportModal(true)}
        >
          <Ionicons name="download-outline" size={20} color={GeistColors.foreground} />
          <Text style={[styles.actionButtonText, styles.actionButtonTextNeutral]}>
            Import Cards
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setShowExportModal(true)}
        >
          <Ionicons name="share-outline" size={20} color={GeistColors.foreground} />
          <Text style={[styles.actionButtonText, styles.actionButtonTextNeutral]}>
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
    backgroundColor: GeistColors.canvas,
  },
  header: {
    backgroundColor: GeistColors.surface,
    padding: GeistSpacing.xl,
    borderBottomWidth: GeistBorders.thick,
    borderBottomColor: GeistColors.border,
    ...GeistShadows.sm,
  },
  deckName: {
    ...GeistTypography.headline,
    color: GeistColors.foreground,
    backgroundColor: GeistColors.violetLight,
    paddingHorizontal: GeistSpacing.sm,
    paddingVertical: 4,
    borderWidth: GeistBorders.medium,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.sm,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  deckDescription: {
    ...GeistTypography.body,
    color: GeistColors.gray700,
    lineHeight: 24,
    marginTop: GeistSpacing.sm,
  },
  statsContainer: {
    ...GeistComponents.card.spacious,
    margin: GeistSpacing.lg,
    backgroundColor: GeistColors.pastelViolet,
  },
  sectionTitle: {
    ...GeistTypography.caption,
    color: GeistColors.gray800,
    marginBottom: GeistSpacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GeistSpacing.md,
  },
  statBox: {
    minWidth: 100,
    flex: 1,
    alignItems: 'center',
    backgroundColor: GeistColors.surface,
    borderWidth: GeistBorders.medium,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.sm,
    paddingVertical: GeistSpacing.md,
    paddingHorizontal: GeistSpacing.sm,
    ...GeistShadows.sm,
  },
  statValue: {
    fontSize: GeistFontSizes.xxl,
    fontWeight: '700',
    color: GeistColors.foreground,
  },
  statLabel: {
    ...GeistTypography.caption,
    color: GeistColors.gray600,
  },
  actionsContainer: {
    ...GeistComponents.card.spacious,
    backgroundColor: GeistColors.surface,
    marginHorizontal: GeistSpacing.lg,
    marginTop: 0,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: GeistSpacing.sm,
    ...GeistComponents.button.outline,
    backgroundColor: GeistColors.surface,
    marginBottom: GeistSpacing.md,
    minHeight: 56,
  },
  primaryButton: {
    ...GeistComponents.button.primary,
    gap: GeistSpacing.sm,
  },
  actionButtonText: {
    ...GeistTypography.button,
    color: GeistColors.foreground,
  },
  actionButtonTextNeutral: {
    color: GeistColors.foreground,
  },
  infoContainer: {
    ...GeistComponents.card.spacious,
    backgroundColor: GeistColors.pastelTeal,
    marginHorizontal: GeistSpacing.lg,
    marginTop: GeistSpacing.lg,
    marginBottom: GeistSpacing.xxl,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: GeistSpacing.md,
    borderBottomWidth: GeistBorders.medium,
    borderBottomColor: GeistColors.border,
    gap: GeistSpacing.md,
  },
  infoLabel: {
    ...GeistTypography.body,
    color: GeistColors.gray700,
    flex: 1,
  },
  infoValue: {
    ...GeistTypography.bodyStrong,
    color: GeistColors.foreground,
    flex: 1,
    textAlign: 'right',
  },
});

export default DeckDetailScreen;
