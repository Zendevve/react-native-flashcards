import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import {
  GeistColors,
  GeistSpacing,
  GeistFontSizes,
  GeistBorderRadius,
  GeistBorders,
  GeistComponents,
  GeistTypography,
} from '../theme/geist';
import { useResponsive } from '../hooks/useResponsive';
import { parseCSV, exportToCSV, validateCSV, downloadCSVWeb, DEFAULT_CSV_OPTIONS } from '../utils/csvImportExport';
import { Card } from '../types';

interface ImportExportModalProps {
  visible: boolean;
  mode: 'import' | 'export';
  deckId: string;
  deckName: string;
  cards?: Card[];
  onClose: () => void;
  onImport: (cards: { front: string; back: string }[]) => void;
}

const ImportExportModal: React.FC<ImportExportModalProps> = ({
  visible,
  mode,
  deckId,
  deckName,
  cards = [],
  onClose,
  onImport,
}) => {
  const [delimiter, setDelimiter] = useState(',');
  const [hasHeader, setHasHeader] = useState(true);
  const [previewData, setPreviewData] = useState<{ front: string; back: string }[]>([]);
  const [csvContent, setCsvContent] = useState('');

  const { isPhone } = useResponsive();
  const isMobile = isPhone;

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/comma-separated-values',
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        // Read file content
        const response = await fetch(file.uri);
        const content = await response.text();
        
        setCsvContent(content);
        
        // Validate and preview
        const validation = validateCSV(content, {
          ...DEFAULT_CSV_OPTIONS,
          delimiter,
          hasHeader,
        });

        if (!validation.valid) {
          Alert.alert('Invalid CSV', validation.errors.join('\n'));
          return;
        }

        const parsed = parseCSV(content, {
          ...DEFAULT_CSV_OPTIONS,
          delimiter,
          hasHeader,
        });

        setPreviewData(parsed.slice(0, 5)); // Show first 5 cards
        Alert.alert(
          'CSV Loaded',
          `Found ${validation.cardCount} valid cards. Preview shown below.`
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to read CSV file');
      console.error(error);
    }
  };

  const handleImport = () => {
    if (!csvContent) {
      Alert.alert('Error', 'Please select a CSV file first');
      return;
    }

    const parsed = parseCSV(csvContent, {
      ...DEFAULT_CSV_OPTIONS,
      delimiter,
      hasHeader,
    });

    if (parsed.length === 0) {
      Alert.alert('Error', 'No valid cards found in CSV');
      return;
    }

    Alert.alert(
      'Confirm Import',
      `Import ${parsed.length} cards into "${deckName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import',
          onPress: () => {
            onImport(parsed);
            onClose();
          },
        },
      ]
    );
  };

  const handleExport = () => {
    if (cards.length === 0) {
      Alert.alert('Error', 'No cards to export');
      return;
    }

    const csv = exportToCSV(cards, {
      delimiter,
      includeHeader: hasHeader,
      includeMetadata: false,
    });

    const filename = `${deckName.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.csv`;

    if (Platform.OS === 'web') {
      downloadCSVWeb(csv, filename);
      Alert.alert('Success', `Exported ${cards.length} cards`);
      onClose();
    } else {
      // For mobile, we'd use expo-sharing here
      Alert.alert('Export', 'Mobile export coming soon. Use web version for now.');
    }
  };

  const renderImportUI = () => (
    <>
      <Text style={styles.label}>Delimiter</Text>
      <View style={styles.delimiterButtons}>
        {[',', '\t', ';', '|'].map((d) => (
          <TouchableOpacity
            key={d}
            style={[styles.delimiterButton, delimiter === d && styles.delimiterButtonActive]}
            onPress={() => setDelimiter(d)}
          >
            <Text style={[styles.delimiterText, delimiter === d && styles.delimiterTextActive]}>
              {d === '\t' ? 'Tab' : d === ',' ? 'Comma' : d === ';' ? 'Semicolon' : 'Pipe'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setHasHeader(!hasHeader)}
      >
        <View style={[styles.checkbox, hasHeader && styles.checkboxChecked]}>
          {hasHeader && <Ionicons name="checkmark" size={16} color={GeistColors.background} />}
        </View>
        <Text style={styles.checkboxLabel}>First row is header</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.primaryButton} onPress={handlePickFile}>
        <Ionicons name="document-outline" size={20} color={GeistColors.background} />
        <Text style={styles.primaryButtonText}>Select CSV File</Text>
      </TouchableOpacity>

      {previewData.length > 0 && (
        <>
          <Text style={styles.previewTitle}>Preview (first 5 cards):</Text>
          <ScrollView style={styles.previewContainer}>
            {previewData.map((card, index) => (
              <View key={index} style={styles.previewCard}>
                <Text style={styles.previewLabel}>Front:</Text>
                <Text style={styles.previewText}>{card.front}</Text>
                <Text style={styles.previewLabel}>Back:</Text>
                <Text style={styles.previewText}>{card.back}</Text>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.primaryButton} onPress={handleImport}>
            <Ionicons name="download-outline" size={20} color={GeistColors.background} />
            <Text style={styles.primaryButtonText}>Import Cards</Text>
          </TouchableOpacity>
        </>
      )}
    </>
  );

  const renderExportUI = () => (
    <>
      <Text style={styles.infoText}>
        Export {cards.length} cards from "{deckName}"
      </Text>

      <Text style={styles.label}>Delimiter</Text>
      <View style={styles.delimiterButtons}>
        {[',', '\t', ';', '|'].map((d) => (
          <TouchableOpacity
            key={d}
            style={[styles.delimiterButton, delimiter === d && styles.delimiterButtonActive]}
            onPress={() => setDelimiter(d)}
          >
            <Text style={[styles.delimiterText, delimiter === d && styles.delimiterTextActive]}>
              {d === '\t' ? 'Tab' : d === ',' ? 'Comma' : d === ';' ? 'Semicolon' : 'Pipe'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setHasHeader(!hasHeader)}
      >
        <View style={[styles.checkbox, hasHeader && styles.checkboxChecked]}>
          {hasHeader && <Ionicons name="checkmark" size={16} color={GeistColors.background} />}
        </View>
        <Text style={styles.checkboxLabel}>Include header row</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.primaryButton} onPress={handleExport}>
        <Ionicons name="share-outline" size={20} color={GeistColors.background} />
        <Text style={styles.primaryButtonText}>Export CSV</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {mode === 'import' ? 'Import Cards' : 'Export Deck'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={GeistColors.foreground} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentInner}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {mode === 'import' ? renderImportUI() : renderExportUI()}
          </ScrollView>

          <View style={styles.cancelButtonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    ...GeistComponents.card.spacious,
    borderTopLeftRadius: GeistBorderRadius.lg,
    borderTopRightRadius: GeistBorderRadius.lg,
    borderBottomLeftRadius: GeistBorderRadius.lg,
    borderBottomRightRadius: GeistBorderRadius.lg,
    backgroundColor: GeistColors.surface,
    maxHeight: '92%',
    marginHorizontal: GeistSpacing.lg,
    marginBottom: GeistSpacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: GeistSpacing.lg,
    borderBottomWidth: GeistBorders.medium,
    borderBottomColor: GeistColors.border,
  },
  title: {
    ...GeistTypography.headline,
    color: GeistColors.foreground,
  },
  content: {
    paddingHorizontal: GeistSpacing.lg,
    paddingVertical: GeistSpacing.md,
  },
  contentInner: {
    gap: GeistSpacing.md,
  },
  label: {
    ...GeistTypography.caption,
    color: GeistColors.gray700,
  },
  delimiterButtons: {
    flexDirection: 'row',
    gap: GeistSpacing.sm,
    marginBottom: GeistSpacing.md,
    flexWrap: 'wrap',
  },
  delimiterButton: {
    flex: 1,
    minWidth: 120,
    ...GeistComponents.button.outline,
    backgroundColor: GeistColors.surface,
  },
  delimiterButtonActive: {
    backgroundColor: GeistColors.violet,
    borderColor: GeistColors.border,
  },
  delimiterText: {
    ...GeistTypography.button,
    color: GeistColors.foreground,
  },
  delimiterTextActive: {
    color: GeistColors.foreground,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: GeistSpacing.lg,
    gap: GeistSpacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: GeistBorderRadius.sm,
    borderWidth: GeistBorders.medium,
    borderColor: GeistColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: GeistColors.violet,
    borderColor: GeistColors.border,
  },
  checkboxLabel: {
    ...GeistTypography.body,
    color: GeistColors.foreground,
  },
  primaryButton: {
    ...GeistComponents.button.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: GeistSpacing.sm,
  },
  primaryButtonText: {
    ...GeistTypography.button,
    color: GeistColors.foreground,
  },
  cancelButtonContainer: {
    padding: GeistSpacing.lg,
    borderTopWidth: GeistBorders.medium,
    borderTopColor: GeistColors.border,
    alignItems: 'center',
  },
  cancelButton: {
    ...GeistComponents.button.outline,
    backgroundColor: GeistColors.surface,
  },
  cancelButtonText: {
    ...GeistTypography.button,
    color: GeistColors.gray700,
  },
  infoText: {
    ...GeistTypography.body,
    color: GeistColors.gray700,
    marginBottom: GeistSpacing.lg,
    lineHeight: 22,
  },
  previewTitle: {
    ...GeistTypography.caption,
    color: GeistColors.gray700,
    marginTop: GeistSpacing.md,
    marginBottom: GeistSpacing.sm,
  },
  previewContainer: {
    maxHeight: 240,
    marginBottom: GeistSpacing.md,
  },
  previewCard: {
    ...GeistComponents.card.default,
    backgroundColor: GeistColors.surface,
    marginBottom: GeistSpacing.sm,
  },
  previewLabel: {
    ...GeistTypography.caption,
    color: GeistColors.gray600,
    marginBottom: GeistSpacing.xs,
  },
  previewText: {
    ...GeistTypography.body,
    color: GeistColors.foreground,
    marginBottom: GeistSpacing.xs,
  },
});

export default ImportExportModal;
