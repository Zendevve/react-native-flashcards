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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { useStore } from '../store/useStore';
import { Card } from '../types';
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
import { useResponsive } from '../hooks/useResponsive';

type RouteProps = RouteProp<RootStackParamList, 'CardList'>;

const CardListScreen = () => {
  const route = useRoute<RouteProps>();
  const { deckId } = route.params;

  const { cards, loadCards, createCard, updateCard, deleteCard, searchCards } = useStore();
  const { isTablet, isPhone } = useResponsive();
  const isMobile = isPhone;
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
    <View style={[styles.cardItem, isMobile && styles.cardItemMobile]}>
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
      <View style={[styles.cardActions, isMobile && styles.cardActionsMobile]}>
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
          <Ionicons name="search" size={16} color={GeistColors.foreground} />
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
        contentContainerStyle={[styles.listContent, isMobile && styles.listContentMobile]}
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

      {isMobile ? (
        <View style={styles.mobileActionBar}>
          <TouchableOpacity
            style={styles.mobileActionButton}
            onPress={() => {
              setEditingCard(null);
              setFrontText('');
              setBackText('');
              setShowCreateModal(true);
            }}
          >
            <Ionicons name="add-circle" size={24} color={GeistColors.foreground} />
            <Text style={styles.mobileActionText}>New Card</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            setEditingCard(null);
            setFrontText('');
            setBackText('');
            setShowCreateModal(true);
          }}
        >
          <Ionicons name="add" size={24} color={GeistColors.foreground} />
        </TouchableOpacity>
      )}

      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isMobile && styles.modalContentMobile]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingCard ? 'Edit Card' : 'New Card'}
              </Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={GeistColors.gray600} />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.modalForm}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
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
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GeistColors.canvas,
  },
  header: {
    backgroundColor: GeistColors.surface,
    padding: GeistSpacing.lg,
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
  cardItem: {
    ...GeistComponents.card.default,
    backgroundColor: GeistColors.surface,
    marginBottom: GeistSpacing.md,
    flexDirection: 'row',
    gap: GeistSpacing.md,
  },
  cardItemMobile: {
    flexDirection: 'column',
  },
  cardContent: {
    flex: 1,
    gap: GeistSpacing.sm,
  },
  cardSide: {
    marginBottom: 0,
  },
  sideLabel: {
    ...GeistTypography.caption,
    color: GeistColors.gray700,
    marginBottom: GeistSpacing.xs,
  },
  cardText: {
    ...GeistTypography.body,
    color: GeistColors.foreground,
    lineHeight: 20,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GeistSpacing.sm,
  },
  stateBadge: {
    ...GeistComponents.badge,
  },
  stateText: {
    ...GeistTypography.badge,
    color: GeistColors.foreground,
  },
  intervalText: {
    ...GeistTypography.caption,
    color: GeistColors.gray600,
  },
  cardActions: {
    justifyContent: 'center',
    marginLeft: GeistSpacing.sm,
    flexDirection: 'column',
    gap: GeistSpacing.sm,
  },
  cardActionsMobile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 0,
  },
  iconButton: {
    padding: GeistSpacing.sm,
    borderWidth: GeistBorders.medium,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.sm,
    backgroundColor: GeistColors.surface,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: GeistSpacing.lg,
  },
  modalContent: {
    ...GeistComponents.card.spacious,
    backgroundColor: GeistColors.surface,
    maxHeight: '85%',
  },
  modalContentMobile: {
    padding: GeistSpacing.lg,
    borderRadius: GeistBorderRadius.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: GeistSpacing.lg,
  },
  modalTitle: {
    ...GeistTypography.headline,
    color: GeistColors.foreground,
  },
  modalForm: {
    gap: GeistSpacing.md,
  },
  inputLabel: {
    ...GeistTypography.caption,
    color: GeistColors.gray700,
    marginBottom: GeistSpacing.xs,
  },
  input: {
    ...GeistComponents.input,
    marginBottom: GeistSpacing.md,
    color: GeistColors.foreground,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    marginTop: GeistSpacing.md,
    gap: GeistSpacing.sm,
  },
  button: {
    ...GeistComponents.button.outline,
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: GeistColors.surface,
  },
  cancelButtonText: {
    ...GeistTypography.button,
    color: GeistColors.gray700,
  },
  saveButton: {
    ...GeistComponents.button.primary,
  },
  saveButtonText: {
    ...GeistTypography.button,
    color: GeistColors.foreground,
  },
});

export default CardListScreen;
