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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useStore } from '../store/useStore';
import { Deck } from '../types';
import { DEFAULT_DECK_SETTINGS } from '../types';
import { GeistColors, GeistSpacing, GeistFontSizes, GeistBorderRadius, GeistShadows } from '../theme/geist';
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
        style={styles.deckCard}
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
            <Ionicons name="trash-outline" size={16} color={GeistColors.gray500} />
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
            style={styles.studyButton}
            onPress={() => navigation.navigate('Study', { deckId: item.id })}
          >
            <Text style={styles.studyButtonText}>
              Study Now {stats?.dueCards ? `(${stats.dueCards} ${stats.dueCards === 1 ? 'card' : 'cards'})` : ''}
            </Text>
            <Ionicons name="arrow-forward" size={16} color={GeistColors.background} />
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

  return (
    <View style={styles.container}>
      {/* Quick Stats Banner */}
      {decks.length > 0 && (
        <View style={styles.quickStats}>
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
        </View>
      )}

      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={GeistColors.gray500} />
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
          isTablet && { maxWidth: 1200, alignSelf: 'center', width: '100%' }
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

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
      >
        <Ionicons name="add" size={24} color={GeistColors.background} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GeistColors.background,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: GeistSpacing.md,
    paddingHorizontal: GeistSpacing.md,
    backgroundColor: GeistColors.gray50,
    borderBottomWidth: 1,
    borderBottomColor: GeistColors.border,
  },
  quickStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GeistSpacing.xs,
  },
  quickStatText: {
    fontSize: GeistFontSizes.sm,
    color: GeistColors.foreground,
    fontWeight: '500',
  },
  header: {
    backgroundColor: GeistColors.background,
    paddingHorizontal: GeistSpacing.md,
    paddingTop: GeistSpacing.md,
    paddingBottom: GeistSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: GeistColors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GeistColors.gray50,
    borderWidth: 1,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.sm,
    paddingHorizontal: GeistSpacing.sm,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: GeistSpacing.sm,
    fontSize: GeistFontSizes.sm,
    color: GeistColors.foreground,
    paddingVertical: 0,
    includeFontPadding: false,
  },
  listContent: {
    padding: GeistSpacing.md,
  },
  deckCard: {
    backgroundColor: GeistColors.background,
    borderWidth: 1,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.md,
    padding: GeistSpacing.md,
    marginBottom: GeistSpacing.sm,
    flex: 1,
    marginHorizontal: GeistSpacing.xs,
  },
  deckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: GeistSpacing.md,
  },
  deckInfo: {
    flex: 1,
  },
  deckName: {
    fontSize: GeistFontSizes.lg,
    fontWeight: '600',
    color: GeistColors.foreground,
    marginBottom: GeistSpacing.xs,
  },
  deckDescription: {
    fontSize: GeistFontSizes.sm,
    color: GeistColors.gray600,
    lineHeight: 20,
  },
  deleteButton: {
    padding: GeistSpacing.xs,
  },
  deckStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: GeistSpacing.md,
    borderTopWidth: 1,
    borderTopColor: GeistColors.border,
    marginTop: GeistSpacing.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: GeistFontSizes.xl,
    fontWeight: '600',
    color: GeistColors.foreground,
  },
  dueValue: {
    color: GeistColors.accent,
  },
  statLabel: {
    fontSize: GeistFontSizes.xs,
    color: GeistColors.gray500,
    marginTop: GeistSpacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  studyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GeistColors.foreground,
    borderRadius: GeistBorderRadius.sm,
    paddingVertical: GeistSpacing.md,
    marginTop: GeistSpacing.md,
    minHeight: 44,
  },
  studyButtonText: {
    color: GeistColors.background,
    fontSize: GeistFontSizes.sm,
    fontWeight: '500',
    marginRight: GeistSpacing.xs,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  emptyDeckPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: GeistSpacing.md,
    gap: GeistSpacing.xs,
  },
  emptyDeckText: {
    fontSize: GeistFontSizes.sm,
    color: GeistColors.gray500,
  },
  allDonePrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: GeistSpacing.md,
    gap: GeistSpacing.xs,
  },
  allDoneText: {
    fontSize: GeistFontSizes.sm,
    color: GeistColors.foreground,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: GeistSpacing.xxxl,
  },
  emptyText: {
    fontSize: GeistFontSizes.lg,
    fontWeight: '500',
    color: GeistColors.gray400,
    marginTop: GeistSpacing.md,
  },
  emptySubtext: {
    fontSize: GeistFontSizes.sm,
    color: GeistColors.gray400,
    marginTop: GeistSpacing.xs,
  },
  fab: {
    position: 'absolute',
    right: GeistSpacing.lg,
    bottom: GeistSpacing.lg,
    width: 56,
    height: 56,
    borderRadius: GeistBorderRadius.sm,
    backgroundColor: GeistColors.foreground,
    alignItems: 'center',
    justifyContent: 'center',
    ...GeistShadows.md,
  },
  createModal: {
    backgroundColor: GeistColors.background,
    margin: GeistSpacing.md,
    padding: GeistSpacing.lg,
    borderWidth: 1,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.md,
    ...GeistShadows.lg,
  },
  modalTitle: {
    fontSize: GeistFontSizes.xl,
    fontWeight: '600',
    marginBottom: GeistSpacing.lg,
    color: GeistColors.foreground,
  },
  input: {
    borderWidth: 1,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.sm,
    padding: GeistSpacing.sm,
    fontSize: GeistFontSizes.sm,
    marginBottom: GeistSpacing.md,
    color: GeistColors.foreground,
    backgroundColor: GeistColors.background,
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
    paddingHorizontal: GeistSpacing.md,
    paddingVertical: GeistSpacing.md,
    borderRadius: GeistBorderRadius.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: GeistColors.background,
    borderWidth: 1,
    borderColor: GeistColors.border,
  },
  cancelButtonText: {
    color: GeistColors.gray600,
    fontSize: GeistFontSizes.sm,
    fontWeight: '500',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  createButton: {
    backgroundColor: GeistColors.foreground,
  },
  createButtonText: {
    color: GeistColors.background,
    fontSize: GeistFontSizes.sm,
    fontWeight: '500',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default HomeScreen;
