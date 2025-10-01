import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { useStore } from '../store/useStore';
import { Card } from '../types';
import { GeistColors, GeistSpacing, GeistFontSizes, GeistBorderRadius, GeistShadows } from '../theme/geist';

type RouteProps = RouteProp<RootStackParamList, 'CardList'>;

const CardListScreen = () => {
  const route = useRoute<RouteProps>();
  const { deckId } = route.params;

  const { cards, loadCards, createCard, updateCard, deleteCard, searchCards } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [frontText, setFrontText] = useState('');
  const [backText, setBackText] = useState('');

  useEffect(() => {
    loadCards(deckId);
  }, [deckId]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchCards(deckId, query);
    } else {
      loadCards(deckId);
    }
  };

  const handleSaveCard = async () => {
    if (!frontText.trim() || !backText.trim()) {
      Alert.alert('Error', 'Please fill in both front and back of the card');
      return;
    }

    try {
      if (editingCard) {
        await updateCard(editingCard.id, {
          front: frontText.trim(),
          back: backText.trim(),
        });
      } else {
        await createCard({
          deckId,
          front: frontText.trim(),
          back: backText.trim(),
          state: 'new',
          interval: 0,
          easeFactor: 2.5,
          repetitions: 0,
          nextReviewDate: Date.now(),
          lastReviewed: null,
        });
      }
      setFrontText('');
      setBackText('');
      setEditingCard(null);
      setShowCreateModal(false);
      loadCards(deckId);
    } catch (error) {
      Alert.alert('Error', 'Failed to save card');
    }
  };

  const handleEditCard = (card: Card) => {
    setEditingCard(card);
    setFrontText(card.front);
    setBackText(card.back);
    setShowCreateModal(true);
  };

  const handleDeleteCard = (card: Card) => {
    Alert.alert(
      'Delete Card',
      'Are you sure you want to delete this card?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteCard(card.id);
            loadCards(deckId);
          },
        },
      ]
    );
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'new':
        return '#2196f3';
      case 'learning':
        return '#ff9800';
      case 'review':
        return '#4caf50';
      case 'mastered':
        return '#9c27b0';
      default:
        return '#999';
    }
  };

  const renderCardItem = ({ item }: { item: Card }) => (
    <View style={styles.cardItem}>
      <View style={styles.cardContent}>
        <View style={styles.cardSide}>
          <Text style={styles.sideLabel}>Front:</Text>
          <Text style={styles.cardText} numberOfLines={2}>
            {item.front}
          </Text>
        </View>
        <View style={styles.cardSide}>
          <Text style={styles.sideLabel}>Back:</Text>
          <Text style={styles.cardText} numberOfLines={2}>
            {item.back}
          </Text>
        </View>
        <View style={styles.cardMeta}>
          <View style={[styles.stateBadge, { backgroundColor: getStateColor(item.state) }]}>
            <Text style={styles.stateText}>{item.state.toUpperCase()}</Text>
          </View>
          <Text style={styles.intervalText}>
            Interval: {item.interval.toFixed(1)} days
          </Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => handleEditCard(item)}
        >
          <Ionicons name="pencil" size={16} color={GeistColors.foreground} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => handleDeleteCard(item)}
        >
          <Ionicons name="trash-outline" size={16} color={GeistColors.gray500} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={GeistColors.gray500} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search cards..."
            placeholderTextColor={GeistColors.gray400}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      <FlatList
        data={cards}
        renderItem={renderCardItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="documents-outline" size={64} color={GeistColors.gray300} />
            <Text style={styles.emptyText}>No cards yet</Text>
            <Text style={styles.emptySubtext}>
              Add your first card to start learning
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditingCard(null);
          setFrontText('');
          setBackText('');
          setShowCreateModal(true);
        }}
      >
        <Ionicons name="add" size={24} color={GeistColors.background} />
      </TouchableOpacity>

      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingCard ? 'Edit Card' : 'New Card'}
              </Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={GeistColors.gray600} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Front (Question):</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter question or term..."
              placeholderTextColor={GeistColors.gray400}
              value={frontText}
              onChangeText={setFrontText}
              multiline
              numberOfLines={4}
              autoFocus
            />

            <Text style={styles.inputLabel}>Back (Answer):</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter answer or definition..."
              placeholderTextColor={GeistColors.gray400}
              value={backText}
              onChangeText={setBackText}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setShowCreateModal(false);
                  setEditingCard(null);
                  setFrontText('');
                  setBackText('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveCard}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GeistColors.background,
  },
  header: {
    backgroundColor: GeistColors.background,
    padding: GeistSpacing.md,
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
  cardItem: {
    backgroundColor: GeistColors.background,
    borderWidth: 1,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.md,
    padding: GeistSpacing.md,
    marginBottom: GeistSpacing.sm,
    flexDirection: 'row',
  },
  cardContent: {
    flex: 1,
  },
  cardSide: {
    marginBottom: GeistSpacing.sm,
  },
  sideLabel: {
    fontSize: GeistFontSizes.xs,
    color: GeistColors.gray500,
    marginBottom: GeistSpacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardText: {
    fontSize: GeistFontSizes.sm,
    color: GeistColors.foreground,
    lineHeight: 20,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: GeistSpacing.xs,
  },
  stateBadge: {
    paddingHorizontal: GeistSpacing.xs,
    paddingVertical: 2,
    borderRadius: GeistBorderRadius.sm,
    marginRight: GeistSpacing.sm,
    borderWidth: 1,
    borderColor: GeistColors.border,
    backgroundColor: GeistColors.gray50,
  },
  stateText: {
    color: GeistColors.foreground,
    fontSize: GeistFontSizes.xs,
    fontWeight: '500',
  },
  intervalText: {
    fontSize: GeistFontSizes.xs,
    color: GeistColors.gray500,
  },
  cardActions: {
    justifyContent: 'center',
    marginLeft: GeistSpacing.sm,
  },
  iconButton: {
    padding: GeistSpacing.xs,
    marginVertical: GeistSpacing.xs,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: GeistSpacing.md,
  },
  modalContent: {
    backgroundColor: GeistColors.background,
    borderWidth: 1,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.md,
    padding: GeistSpacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: GeistSpacing.lg,
  },
  modalTitle: {
    fontSize: GeistFontSizes.xl,
    fontWeight: '600',
    color: GeistColors.foreground,
  },
  inputLabel: {
    fontSize: GeistFontSizes.xs,
    fontWeight: '500',
    color: GeistColors.gray600,
    marginBottom: GeistSpacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    height: 100,
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
  saveButton: {
    backgroundColor: GeistColors.foreground,
  },
  saveButtonText: {
    color: GeistColors.background,
    fontSize: GeistFontSizes.sm,
    fontWeight: '500',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default CardListScreen;
