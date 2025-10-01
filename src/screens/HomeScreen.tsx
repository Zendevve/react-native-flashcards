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
import { useResponsive, useGridColumns } from '../hooks/useResponsive';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { decks, deckStats, loadDecks, createDeck, deleteDeck, loadDeckStats } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');
  
  const { isTablet, width } = useResponsive();
  const isMobile = !isTablet;
  const numColumns = useGridColumns(1);

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

    return (
      <TouchableOpacity
        style={[styles.deckCard, isMobile && styles.deckCardMobile]}
        onPress={() => navigation.navigate('DeckDetail', { deckId: item.id })}
      >
        <View style={styles.deckHeader}>
          <View style={styles.deckInfo}>
            <Text style={styles.deckName}>{item.name}</Text>
            {item.description ? (
              <Text style={styles.deckDescription} numberOfLines={2}>
                {item.description}
              </Text>
            ) : null}
          </View>
          <TouchableOpacity
            onPress={() => handleDeleteDeck(item)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={16} color={GeistColors.foreground} />
          </TouchableOpacity>
        </View>

        <View style={styles.deckStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.totalCards || 0}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.newCards || 0}</Text>
            <Text style={styles.statLabel}>New</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, dueCards > 0 && styles.dueValue]}>
              {dueCards}
            </Text>
          </View>
        </View>

        {stats?.totalCards === 0 ? (
          <View style={styles.emptyDeckPrompt}>
            <Ionicons name="add-circle-outline" size={20} color={GeistColors.gray400} />
            <Text style={styles.emptyDeckText}>Add cards to start studying</Text>
          </View>
        ) : dueCards > 0 ? (
          <TouchableOpacity
            style={[styles.studyButton, isMobile && styles.studyButtonMobile]}
            onPress={() => navigation.navigate('Study', { deckId: item.id })}
          >
            <Text style={styles.studyButtonText}>
              Study Now {stats?.dueCards ? `(${stats.dueCards} ${stats.dueCards === 1 ? 'card' : 'cards'})` : ''}
            </Text>
            <Ionicons name="arrow-forward" size={16} color={GeistColors.foreground} />
          </TouchableOpacity>
        ) : (
          <View style={styles.allDonePrompt}>
            <Ionicons name="checkmark-circle" size={20} color={GeistColors.foreground} />
            <Text style={styles.allDoneText}>✓ All caught up!</Text>
          </View>
        )}
      </TouchableOpacity>
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

  return (
    <View style={styles.container}>
      {/* Quick Stats Banner */}
      {decks.length > 0 && (
        <View style={styles.quickStatsWrapper}>
          {isMobile ? (
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
          <Ionicons name="search" size={16} color={GeistColors.foreground} />
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
            <Ionicons name="albums-outline" size={64} color={GeistColors.gray300} />
            <Text style={styles.emptyText}>No decks yet</Text>
            <Text style={styles.emptySubtext}>
              Create your first deck to get started
            </Text>
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
    ...GeistShadows.md,
  },
  quickStatsWrapper: {
    marginHorizontal: GeistSpacing.md,
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
  deckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: GeistSpacing.md,
    gap: GeistSpacing.md,
  },
  deckInfo: {
    flex: 1,
    gap: GeistSpacing.xs,
  },
  deckName: {
    ...GeistTypography.title,
    color: GeistColors.foreground,
    backgroundColor: GeistColors.surface,
    paddingHorizontal: GeistSpacing.sm,
    paddingVertical: 4,
    borderWidth: GeistBorders.medium,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.sm,
  },
  deckDescription: {
    ...GeistTypography.body,
    color: GeistColors.gray800,
    lineHeight: 22,
  },
  deleteButton: {
    padding: GeistSpacing.xs,
    borderWidth: GeistBorders.medium,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.sm,
    backgroundColor: GeistColors.surface,
  },
  deckStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: GeistSpacing.md,
    borderTopWidth: GeistBorders.medium,
    borderTopColor: GeistColors.border,
    marginTop: GeistSpacing.sm,
    gap: GeistSpacing.md,
  },
  statItem: {
    alignItems: 'center',
    gap: GeistSpacing.xs,
  },
  statValue: {
    fontSize: GeistFontSizes.xxl,
    fontWeight: GeistFontWeights.black,
    color: GeistColors.foreground,
  },
  dueValue: {
    color: GeistColors.coralDark,
  },
  statLabel: {
    ...GeistTypography.caption,
    color: GeistColors.gray600,
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
    gap: GeistSpacing.md,
  },
  emptyText: {
    ...GeistTypography.title,
    color: GeistColors.foreground,
  },
  emptySubtext: {
    ...GeistTypography.body,
    color: GeistColors.gray600,
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
    justifyContent: 'flex-end',
    marginTop: GeistSpacing.sm,
    gap: GeistSpacing.sm,
  },
  button: {
    ...GeistComponents.button.outline,
    minHeight: 44,
    justifyContent: 'center',
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
