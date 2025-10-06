import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
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
  GeistFontWeights,
} from '../theme/geist';
import { useResponsive, useContentWidth } from '../hooks/useResponsive';
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
  const { isPhone, width, orientation } = useResponsive();
  const contentWidth = useContentWidth();
  const isWeb = Platform.OS === 'web';
  const isLandscape = orientation === 'landscape';

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

  const hasDueCards = (stats?.dueCards || 0) > 0;
  const hasCards = (stats?.totalCards || 0) > 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={[
      styles.scrollContent,
      isWeb && width > 1200 && { maxWidth: contentWidth, alignSelf: 'center', width: '100%' }
    ]}>
      {/* Hero Section */}
      <View style={[
        styles.heroSection,
        isLandscape && styles.heroSectionLandscape
      ]}>
        <View style={styles.heroHeader}>
          <View style={styles.heroTitleContainer}>
            <Text style={styles.heroTitle}>{currentDeck.name}</Text>
            {currentDeck.description && (
              <Text style={styles.heroDescription}>{currentDeck.description}</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.settingsIconButton}
            onPress={() => navigation.navigate('DeckSettings', { deckId })}
          >
            <Ionicons name="settings-outline" size={24} color={GeistColors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Primary Action */}
        {hasCards ? (
          hasDueCards ? (
            <TouchableOpacity
              style={styles.primaryStudyButton}
              onPress={handleStartStudy}
              activeOpacity={0.8}
            >
              <Ionicons name="play-circle" size={28} color={GeistColors.foreground} />
              <Text style={styles.primaryStudyButtonText}>
                Start Studying • {stats?.dueCards} cards
              </Text>
              <Ionicons name="arrow-forward" size={24} color={GeistColors.foreground} />
            </TouchableOpacity>
          ) : (
            <View style={styles.allCaughtUpCard}>
              <Ionicons name="checkmark-circle" size={28} color={GeistColors.foreground} />
              <Text style={styles.allCaughtUpText}>All caught up! 🎉</Text>
            </View>
          )
        ) : (
          <TouchableOpacity
            style={styles.addCardsButton}
            onPress={() => navigation.navigate('CardList', { deckId })}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle" size={24} color={GeistColors.foreground} />
            <Text style={styles.addCardsButtonText}>Add Your First Cards</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats Grid */}
      <View style={[
        styles.statsSection,
        isLandscape && styles.statsSectionLandscape
      ]}>
        <View style={styles.statCard}>
          <Ionicons name="albums" size={20} color={GeistColors.violet} />
          <Text style={styles.statCardValue}>{stats?.totalCards || 0}</Text>
          <Text style={styles.statCardLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="sparkles" size={20} color={GeistColors.teal} />
          <Text style={styles.statCardValue}>{stats?.newCards || 0}</Text>
          <Text style={styles.statCardLabel}>New</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="refresh" size={20} color={GeistColors.amber} />
          <Text style={styles.statCardValue}>{stats?.reviewCards || 0}</Text>
          <Text style={styles.statCardLabel}>Review</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="star" size={20} color={GeistColors.lime} />
          <Text style={styles.statCardValue}>{stats?.masteredCards || 0}</Text>
          <Text style={styles.statCardLabel}>Mastered</Text>
        </View>
      </View>

      {/* Quick Actions Grid */}
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('CardList', { deckId })}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconContainer, { backgroundColor: GeistColors.violetLight }]}>
            <Ionicons name="list" size={24} color={GeistColors.foreground} />
          </View>
          <Text style={styles.actionCardText}>View Cards</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => setShowImportModal(true)}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconContainer, { backgroundColor: GeistColors.tealLight }]}>
            <Ionicons name="download" size={24} color={GeistColors.foreground} />
          </View>
          <Text style={styles.actionCardText}>Import</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => setShowExportModal(true)}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconContainer, { backgroundColor: GeistColors.amberLight }]}>
            <Ionicons name="share-social" size={24} color={GeistColors.foreground} />
          </View>
          <Text style={styles.actionCardText}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Deck Info */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Created</Text>
          <Text style={styles.infoValue}>
            {new Date(currentDeck.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Last Studied</Text>
          <Text style={styles.infoValue}>
            {currentDeck.lastStudied
              ? new Date(currentDeck.lastStudied).toLocaleDateString()
              : 'Never'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Category</Text>
          <Text style={styles.infoValue}>{currentDeck.category}</Text>
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
  scrollContent: {
    paddingBottom: GeistSpacing.xxl,
  },
  heroSection: {
    backgroundColor: GeistColors.surface,
    padding: GeistSpacing.xl,
    borderBottomWidth: GeistBorders.thick,
    borderBottomColor: GeistColors.border,
    gap: GeistSpacing.lg,
    ...GeistShadows.md,
  },
  heroSectionLandscape: {
    padding: GeistSpacing.lg,
    gap: GeistSpacing.md,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: GeistSpacing.md,
  },
  heroTitleContainer: {
    flex: 1,
    gap: GeistSpacing.xs,
  },
  heroTitle: {
    ...GeistTypography.headline,
    color: GeistColors.foreground,
  },
  heroDescription: {
    ...GeistTypography.body,
    color: GeistColors.gray600,
    lineHeight: 22,
  },
  settingsIconButton: {
    padding: GeistSpacing.sm,
    borderWidth: GeistBorders.medium,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.sm,
    backgroundColor: GeistColors.gray100,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryStudyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GeistColors.violet,
    borderWidth: GeistBorders.thick,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.md,
    paddingVertical: GeistSpacing.md,
    paddingHorizontal: GeistSpacing.lg,
    gap: GeistSpacing.sm,
    minHeight: 64,
    ...GeistShadows.lg,
    ...(Platform.OS === 'web' && { cursor: 'pointer' as any }),
  },
  primaryStudyButtonText: {
    ...GeistTypography.bodyStrong,
    fontSize: GeistFontSizes.lg,
    color: GeistColors.foreground,
    flex: 1,
    textAlign: 'center',
  },
  allCaughtUpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GeistColors.tealLight,
    borderWidth: GeistBorders.thick,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.md,
    paddingVertical: GeistSpacing.lg,
    gap: GeistSpacing.sm,
    ...GeistShadows.sm,
  },
  allCaughtUpText: {
    ...GeistTypography.bodyStrong,
    fontSize: GeistFontSizes.lg,
    color: GeistColors.foreground,
  },
  addCardsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GeistColors.amberLight,
    borderWidth: GeistBorders.thick,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.md,
    paddingVertical: GeistSpacing.md,
    paddingHorizontal: GeistSpacing.lg,
    gap: GeistSpacing.sm,
    minHeight: 64,
    ...GeistShadows.md,
  },
  addCardsButtonText: {
    ...GeistTypography.bodyStrong,
    fontSize: GeistFontSizes.lg,
    color: GeistColors.foreground,
  },
  statsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: GeistSpacing.lg,
    gap: GeistSpacing.sm,
  },
  statsSectionLandscape: {
    padding: GeistSpacing.md,
    paddingHorizontal: GeistSpacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: 80,
    backgroundColor: GeistColors.surface,
    borderWidth: GeistBorders.thick,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.md,
    padding: GeistSpacing.md,
    alignItems: 'center',
    gap: GeistSpacing.xs,
    ...GeistShadows.sm,
  },
  statCardValue: {
    ...GeistTypography.title,
    color: GeistColors.foreground,
  },
  statCardLabel: {
    ...GeistTypography.caption,
    color: GeistColors.gray600,
  },
  actionsGrid: {
    flexDirection: 'row',
    paddingHorizontal: GeistSpacing.lg,
    gap: GeistSpacing.sm,
    marginBottom: GeistSpacing.lg,
  },
  actionCard: {
    flex: 1,
    backgroundColor: GeistColors.surface,
    borderWidth: GeistBorders.thick,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.md,
    padding: GeistSpacing.lg,
    alignItems: 'center',
    gap: GeistSpacing.sm,
    minHeight: 100,
    ...GeistShadows.sm,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: GeistBorderRadius.sm,
    borderWidth: GeistBorders.medium,
    borderColor: GeistColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCardText: {
    ...GeistTypography.bodyStrong,
    color: GeistColors.foreground,
    textAlign: 'center',
  },
  infoCard: {
    ...GeistComponents.card.default,
    marginHorizontal: GeistSpacing.lg,
    backgroundColor: GeistColors.surface,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: GeistSpacing.sm,
    borderBottomWidth: GeistBorders.medium,
    borderBottomColor: GeistColors.gray200,
  },
  infoLabel: {
    ...GeistTypography.body,
    color: GeistColors.gray600,
  },
  infoValue: {
    ...GeistTypography.bodyStrong,
    color: GeistColors.foreground,
  },
});

export default DeckDetailScreen;
