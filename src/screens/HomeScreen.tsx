import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useStore } from '../store/useStore';
import { Deck } from '../types';
import { DEFAULT_DECK_SETTINGS } from '../types';
import {
  GeistColors,
  GeistSpacing,
  GeistFontSizes,
  GeistBorderRadius,
  GeistShadows,
  GeistFontWeights,
  GeistBorders,
  GeistComponents,
  GeistTypography,
} from '../theme/geist';
import { useResponsive, useGridColumns, useContentWidth } from '../hooks/useResponsive';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { decks, deckStats, loadDecks, createDeck, deleteDeck, loadDeckStats } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');
  
  const { isTablet, width, height, orientation } = useResponsive();
  const isMobile = !isTablet;
  const isLandscape = orientation === 'landscape';
  const gridColumns = useGridColumns(1);
  const numColumns = isLandscape && !isTablet ? 2 : gridColumns;
  const contentWidth = useContentWidth();
  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    loadDecks();
  }, []);
  useEffect(() => {
    // Load stats for all decks
    decks.forEach((deck) => {
      if (!deckStats[deck.id]) {
        loadDeckStats(deck.id);
      }
    });
  }, [decks]);

  const handleCreateDeck = async () => {
    if (!newDeckName.trim()) {
      Alert.alert('Error', 'Please enter a deck name');
      return;
    }

    try {
      console.log('Creating deck:', newDeckName);
      const newDeck = await createDeck({
        name: newDeckName.trim(),
        description: newDeckDescription.trim(),
        category: 'General',
        listId: null,
        lastStudied: null,
        settings: DEFAULT_DECK_SETTINGS,
      });
      console.log('Deck created successfully:', newDeck);
      setNewDeckName('');
      setNewDeckDescription('');
      setShowCreateModal(false);
      // Reload decks to show the new one
      await loadDecks();
    } catch (error) {
      console.error('Failed to create deck:', error);
      Alert.alert('Error', `Failed to create deck: ${error}`);
    }
  };

  const handleDeleteDeck = async (deck: Deck) => {
    const stats = deckStats[deck.id];
    const cardCount = stats?.totalCards || 0;
    
    Alert.alert(
      'Delete Deck',
      `Are you sure you want to delete "${deck.name}"? This will permanently delete ${cardCount} ${cardCount === 1 ? 'card' : 'cards'}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            await deleteDeck(deck.id);
            loadDecks();
          }
        }
      ]
    );
  };

  const renderDeckItem = ({ item }: { item: Deck }) => {
    const stats = deckStats[item.id];
    const dueCards = stats?.dueCards || 0;
    const totalCards = stats?.totalCards || 0;
    const hasCards = totalCards > 0;
    const hasDue = dueCards > 0;

    return (
      <View style={[
        styles.deckCard,
        isMobile && styles.deckCardMobile,
        isLandscape && styles.deckCardLandscape
      ]}>
        {/* Header with name and actions */}
        <TouchableOpacity 
          style={styles.deckHeader}
          onPress={() => navigation.navigate('DeckDetail', { deckId: item.id })}
          activeOpacity={0.8}
        >
          <View style={styles.deckInfo}>
            <Text style={styles.deckName} numberOfLines={1}>{item.name}</Text>
            {item.description ? (
              <Text style={styles.deckDescription} numberOfLines={2}>
                {item.description}
              </Text>
            ) : null}
          </View>
          <View style={styles.deckActions}>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                navigation.navigate('CardList', { deckId: item.id });
              }}
              style={styles.iconButton}
            >
              <Ionicons name="list-outline" size={18} color={GeistColors.foreground} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleDeleteDeck(item);
              }}
              style={styles.iconButton}
            >
              <Ionicons name="trash-outline" size={18} color={GeistColors.foreground} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Stats row */}
        <View style={styles.deckStats}>
          <View style={styles.statChip}>
            <Ionicons name="albums-outline" size={14} color={GeistColors.gray600} />
            <Text style={styles.statChipText}>{totalCards} total</Text>
          </View>
          <View style={styles.statChip}>
            <Ionicons name="sparkles-outline" size={14} color={GeistColors.gray600} />
            <Text style={styles.statChipText}>{stats?.newCards || 0} new</Text>
          </View>
          {hasDue && (
            <View style={[styles.statChip, styles.statChipDue]}>
              <Ionicons name="time" size={14} color={GeistColors.foreground} />
              <Text style={[styles.statChipText, styles.statChipDueText]}>{dueCards} due</Text>
            </View>
          )}
        </View>

        {/* Primary action */}
        {!hasCards ? (
          <TouchableOpacity
            style={styles.emptyDeckButton}
            onPress={() => navigation.navigate('CardList', { deckId: item.id })}
          >
            <Ionicons name="add-circle" size={20} color={GeistColors.foreground} />
            <Text style={styles.emptyDeckButtonText}>Add Cards</Text>
          </TouchableOpacity>
        ) : hasDue ? (
          <TouchableOpacity
            style={styles.studyButtonPrimary}
            onPress={() => navigation.navigate('Study', { deckId: item.id })}
            activeOpacity={0.8}
          >
            <Ionicons name="play-circle" size={24} color={GeistColors.foreground} />
            <Text style={styles.studyButtonPrimaryText}>
              Study Now • {dueCards} {dueCards === 1 ? 'card' : 'cards'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={GeistColors.foreground} />
          </TouchableOpacity>
        ) : (
          <View style={styles.allDoneCard}>
            <Ionicons name="checkmark-circle" size={24} color={GeistColors.foreground} />
            <Text style={styles.allDoneCardText}>All caught up! 🎉</Text>
          </View>
        )}
      </View>
    );
  };

  // Filter decks by search query
  const filteredDecks = decks.filter(deck =>
    deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deck.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate today's stats
  const todayStats = React.useMemo(() => {
    const today = new Date().toDateString();
    let totalStudied = 0;
    let totalDue = 0;
    
    decks.forEach(deck => {
      const stats = deckStats[deck.id];
      if (stats) {
        totalDue += stats.dueCards || 0;
        // Count cards studied today (if lastStudied is today)
        if (deck.lastStudied && new Date(deck.lastStudied).toDateString() === today) {
          totalStudied += stats.totalCards || 0;
        }
      }
    });
    
    return { totalStudied, totalDue };
  }, [decks, deckStats]);

  const quickStatsContent = (
    <>
      <View style={styles.quickStatItem}>
        <Ionicons name="checkmark-circle" size={20} color={GeistColors.foreground} />
        <Text style={styles.quickStatText}>
          {todayStats.totalStudied} studied today
        </Text>
      </View>
      <View style={styles.quickStatItem}>
        <Ionicons name="time" size={20} color={GeistColors.accent} />
        <Text style={styles.quickStatText}>
          {todayStats.totalDue} due now
        </Text>
      </View>
    </>
  );

  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return '☀️ Good morning';
    if (hour < 18) return '👋 Good afternoon';
    return '🌙 Good evening';
  }, []);

  return (
    <View style={styles.container}>
      {/* Welcome Header */}
      <View style={[
        styles.welcomeHeader,
        isLandscape && styles.welcomeHeaderLandscape,
        isWeb && width > 1200 && { maxWidth: contentWidth, alignSelf: 'center', width: '100%' }
      ]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.welcomeSubtext}>Ready to learn?</Text>
        </View>
        {todayStats.totalDue > 0 && (
          <View style={styles.dueBadge}>
            <Text style={styles.dueBadgeText}>{todayStats.totalDue} due</Text>
          </View>
        )}
      </View>

      {/* Quick Stats Banner */}
      {decks.length > 0 && (
        <View style={[
          styles.quickStatsWrapper,
          isLandscape && styles.quickStatsWrapperLandscape
        ]}>
          {isMobile && !isLandscape ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickStatsMobile}
            >
              {quickStatsContent}
            </ScrollView>
          ) : (
            <View style={styles.quickStats}>
              {quickStatsContent}
            </View>
          )}
        </View>
      )}

      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={GeistColors.foreground} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search decks..."
            placeholderTextColor={GeistColors.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {showCreateModal ? (
        <View style={styles.createModal}>
          <Text style={styles.modalTitle}>Create New Deck</Text>
          <TextInput
            style={styles.input}
            placeholder="Deck name"
            placeholderTextColor={GeistColors.gray400}
            value={newDeckName}
            onChangeText={setNewDeckName}
            autoFocus
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description (optional)"
            placeholderTextColor={GeistColors.gray400}
            value={newDeckDescription}
            onChangeText={setNewDeckDescription}
            multiline
            numberOfLines={3}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                setShowCreateModal(false);
                setNewDeckName('');
                setNewDeckDescription('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.createButton]}
              onPress={handleCreateDeck}
            >
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      <FlatList
        data={filteredDecks}
        renderItem={renderDeckItem}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        key={numColumns}
        contentContainerStyle={[
          styles.listContent,
          isTablet && { maxWidth: 1200, alignSelf: 'center', width: '100%' },
          isMobile && styles.listContentMobile,
        ]}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="library-outline" size={56} color={GeistColors.foreground} />
            </View>
            <Text style={styles.emptyText}>Welcome to FlashCards Pro!</Text>
            <Text style={styles.emptySubtext}>
              Create your first deck to start learning{'\n'}
              Tap the button below to begin
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Ionicons name="add-circle" size={20} color={GeistColors.foreground} />
              <Text style={styles.emptyStateButtonText}>Create Your First Deck</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {isMobile ? (
        <View style={styles.mobileActionBar}>
          <TouchableOpacity
            style={styles.mobileActionButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add-circle" size={24} color={GeistColors.foreground} />
            <Text style={styles.mobileActionText}>New Deck</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={32} color={GeistColors.foreground} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GeistColors.canvas,
    paddingBottom: GeistSpacing.xxl,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: GeistSpacing.lg,
    paddingTop: GeistSpacing.lg,
    paddingBottom: GeistSpacing.md,
  },
  welcomeHeaderLandscape: {
    paddingTop: GeistSpacing.md,
    paddingBottom: GeistSpacing.sm,
  },
  greeting: {
    ...GeistTypography.headline,
    color: GeistColors.foreground,
    marginBottom: GeistSpacing.xs,
  },
  welcomeSubtext: {
    ...GeistTypography.body,
    color: GeistColors.gray600,
  },
  dueBadge: {
    backgroundColor: GeistColors.coralLight,
    borderWidth: GeistBorders.thick,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.full,
    paddingHorizontal: GeistSpacing.md,
    paddingVertical: GeistSpacing.sm,
    ...GeistShadows.sm,
  },
  dueBadgeText: {
    ...GeistTypography.bodyStrong,
    color: GeistColors.foreground,
    textTransform: 'uppercase',
  },
  quickStatsWrapper: {
    marginBottom: GeistSpacing.md,
  },
  quickStatsWrapperLandscape: {
    marginBottom: GeistSpacing.sm,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: GeistSpacing.md,
    borderRadius: GeistBorderRadius.lg,
    backgroundColor: GeistColors.pastelViolet,
    borderWidth: GeistBorders.thick,
    borderColor: GeistColors.border,
    paddingVertical: GeistSpacing.md,
    paddingHorizontal: GeistSpacing.lg,
    ...GeistShadows.sm,
  },
  quickStatsMobile: {
    gap: GeistSpacing.md,
    paddingVertical: GeistSpacing.md,
    paddingHorizontal: GeistSpacing.md,
  },
  quickStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GeistSpacing.sm,
    ...GeistTypography.badge,
  },
  quickStatText: {
    ...GeistTypography.subtitle,
    color: GeistColors.foreground,
  },
  header: {
    backgroundColor: GeistColors.surface,
    paddingHorizontal: GeistSpacing.lg,
    paddingTop: GeistSpacing.lg,
    paddingBottom: GeistSpacing.md,
    borderBottomWidth: GeistBorders.thick,
    borderBottomColor: GeistColors.border,
    ...GeistShadows.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    ...GeistComponents.input,
    backgroundColor: GeistColors.surface,
    gap: GeistSpacing.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: 0,
    fontSize: GeistFontSizes.base,
    color: GeistColors.foreground,
    paddingVertical: 0,
    includeFontPadding: false,
  },
  listContent: {
    padding: GeistSpacing.lg,
    gap: GeistSpacing.md,
  },
  listContentMobile: {
    paddingBottom: GeistSpacing.xl * 2,
  },
  deckCard: {
    ...GeistComponents.card.default,
    backgroundColor: GeistColors.surface,
    flex: 1,
    marginHorizontal: GeistSpacing.xs,
    gap: GeistSpacing.md,
  },
  deckCardMobile: {
    padding: GeistSpacing.md,
  },
  deckCardLandscape: {
    padding: GeistSpacing.sm,
    gap: GeistSpacing.sm,
  },
  deckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: GeistSpacing.sm,
    gap: GeistSpacing.md,
  },
  deckInfo: {
    flex: 1,
    gap: GeistSpacing.xs,
  },
  deckName: {
    ...GeistTypography.bodyStrong,
    fontSize: GeistFontSizes.lg,
    color: GeistColors.foreground,
  },
  deckDescription: {
    ...GeistTypography.body,
    fontSize: GeistFontSizes.sm,
    color: GeistColors.gray600,
    lineHeight: 20,
  },
  deckActions: {
    flexDirection: 'row',
    gap: GeistSpacing.xs,
  },
  iconButton: {
    padding: GeistSpacing.sm,
    borderWidth: GeistBorders.medium,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.sm,
    backgroundColor: GeistColors.surface,
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deckStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GeistSpacing.xs,
    marginBottom: GeistSpacing.md,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GeistSpacing.xs,
    paddingHorizontal: GeistSpacing.sm,
    paddingVertical: GeistSpacing.xs,
    backgroundColor: GeistColors.gray100,
    borderWidth: GeistBorders.medium,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.full,
  },
  statChipText: {
    ...GeistTypography.badge,
    fontSize: 11,
    color: GeistColors.gray700,
  },
  statChipDue: {
    backgroundColor: GeistColors.coralLight,
  },
  statChipDueText: {
    color: GeistColors.foreground,
    fontWeight: GeistFontWeights.extrabold,
  },
  studyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...GeistComponents.button.primary,
    marginTop: GeistSpacing.md,
    gap: GeistSpacing.xs,
  },
  studyButtonMobile: {
    width: '100%',
  },
  studyButtonText: {
    ...GeistTypography.button,
    color: GeistColors.foreground,
  },
  studyButtonPrimary: {
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
    minHeight: 56,
    ...GeistShadows.md,
    ...(Platform.OS === 'web' && { cursor: 'pointer' as any }),
  },
  studyButtonPrimaryText: {
    ...GeistTypography.bodyStrong,
    color: GeistColors.foreground,
    flex: 1,
    textAlign: 'center',
  },
  emptyDeckButton: {
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
    minHeight: 52,
    ...GeistShadows.sm,
  },
  emptyDeckButtonText: {
    ...GeistTypography.bodyStrong,
    color: GeistColors.foreground,
  },
  emptyDeckPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: GeistSpacing.md,
    gap: GeistSpacing.xs,
    backgroundColor: GeistColors.pastelAmber,
    borderWidth: GeistBorders.medium,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.sm,
  },
  emptyDeckText: {
    ...GeistTypography.body,
    color: GeistColors.gray700,
  },
  allDoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: GeistSpacing.md,
    gap: GeistSpacing.sm,
    backgroundColor: GeistColors.tealLight,
    borderWidth: GeistBorders.thick,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.md,
    minHeight: 56,
    ...GeistShadows.sm,
  },
  allDoneCardText: {
    ...GeistTypography.bodyStrong,
    color: GeistColors.foreground,
  },
  allDonePrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: GeistSpacing.md,
    gap: GeistSpacing.xs,
    backgroundColor: GeistColors.pastelTeal,
    borderWidth: GeistBorders.medium,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.sm,
    ...GeistShadows.sm,
  },
  allDoneText: {
    ...GeistTypography.button,
    color: GeistColors.foreground,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: GeistSpacing.xxxl,
    gap: GeistSpacing.lg,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: GeistBorderRadius.lg,
    backgroundColor: GeistColors.pastelViolet,
    borderWidth: GeistBorders.thick,
    borderColor: GeistColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...GeistShadows.md,
  },
  emptyText: {
    ...GeistTypography.headline,
    color: GeistColors.foreground,
    textAlign: 'center',
  },
  emptySubtext: {
    ...GeistTypography.body,
    color: GeistColors.gray600,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyStateButton: {
    ...GeistComponents.button.primary,
    flexDirection: 'row',
    gap: GeistSpacing.sm,
    marginTop: GeistSpacing.md,
    minHeight: 56,
  },
  emptyStateButtonText: {
    ...GeistTypography.button,
    color: GeistColors.foreground,
  },
  fab: {
    position: 'absolute',
    right: GeistSpacing.lg,
    bottom: GeistSpacing.lg,
    ...GeistComponents.fab,
  },
  mobileActionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: GeistSpacing.lg,
    paddingTop: GeistSpacing.md,
    paddingBottom: GeistSpacing.lg,
    backgroundColor: GeistColors.canvas,
    borderTopWidth: GeistBorders.thick,
    borderTopColor: GeistColors.border,
    ...GeistShadows.sm,
  },
  mobileActionButton: {
    ...GeistComponents.button.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: GeistSpacing.sm,
  },
  mobileActionText: {
    ...GeistTypography.button,
    color: GeistColors.foreground,
  },
  createModal: {
    ...GeistComponents.card.spacious,
    margin: GeistSpacing.lg,
  },
  modalTitle: {
    ...GeistTypography.headline,
    color: GeistColors.foreground,
  },
  input: {
    ...GeistComponents.input,
    marginBottom: GeistSpacing.md,
    color: GeistColors.foreground,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    marginTop: GeistSpacing.sm,
    gap: GeistSpacing.sm,
  },
  button: {
    ...GeistComponents.button.outline,
    minHeight: 52,
    justifyContent: 'center',
    flex: 1,
  },
  cancelButton: {
    backgroundColor: GeistColors.surface,
  },
  cancelButtonText: {
    ...GeistTypography.button,
    color: GeistColors.gray700,
  },
  createButton: {
    ...GeistComponents.button.primary,
  },
  createButtonText: {
    ...GeistTypography.button,
    color: GeistColors.foreground,
  },
});

export default HomeScreen;
