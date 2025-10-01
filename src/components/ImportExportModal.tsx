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
import { GeistColors, GeistSpacing, GeistFontSizes, GeistBorderRadius } from '../theme/geist';
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

          <ScrollView style={styles.content}>
            {mode === 'import' ? renderImportUI() : renderExportUI()}
          </ScrollView>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
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
    backgroundColor: GeistColors.background,
    borderTopLeftRadius: GeistBorderRadius.md,
    borderTopRightRadius: GeistBorderRadius.md,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: GeistColors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: GeistSpacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: GeistColors.border,
  },
  title: {
    fontSize: GeistFontSizes.xl,
    fontWeight: '600',
    color: GeistColors.foreground,
  },
  content: {
    padding: GeistSpacing.lg,
  },
  label: {
    fontSize: GeistFontSizes.xs,
    fontWeight: '500',
    color: GeistColors.gray600,
    marginBottom: GeistSpacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  delimiterButtons: {
    flexDirection: 'row',
    gap: GeistSpacing.sm,
    marginBottom: GeistSpacing.md,
  },
  delimiterButton: {
    flex: 1,
    paddingVertical: GeistSpacing.sm,
    borderRadius: GeistBorderRadius.sm,
    borderWidth: 1,
    borderColor: GeistColors.border,
    alignItems: 'center',
  },
  delimiterButtonActive: {
    backgroundColor: GeistColors.foreground,
    borderColor: GeistColors.foreground,
  },
  delimiterText: {
    fontSize: GeistFontSizes.sm,
    color: GeistColors.foreground,
    fontWeight: '500',
  },
  delimiterTextActive: {
    color: GeistColors.background,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: GeistSpacing.lg,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: GeistBorderRadius.sm,
    borderWidth: 1,
    borderColor: GeistColors.border,
    marginRight: GeistSpacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: GeistColors.foreground,
    borderColor: GeistColors.foreground,
  },
  checkboxLabel: {
    fontSize: GeistFontSizes.sm,
    color: GeistColors.foreground,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GeistColors.foreground,
    borderRadius: GeistBorderRadius.sm,
    paddingVertical: GeistSpacing.md,
    marginBottom: GeistSpacing.md,
    minHeight: 48,
    gap: GeistSpacing.sm,
  },
  primaryButtonText: {
    color: GeistColors.background,
    fontSize: GeistFontSizes.sm,
    fontWeight: '500',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  cancelButton: {
    padding: GeistSpacing.lg,
    borderTopWidth: 1,
    borderTopColor: GeistColors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: GeistFontSizes.sm,
    color: GeistColors.gray600,
    fontWeight: '500',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  infoText: {
    fontSize: GeistFontSizes.sm,
    color: GeistColors.gray600,
    marginBottom: GeistSpacing.lg,
    lineHeight: 20,
  },
  previewTitle: {
    fontSize: GeistFontSizes.xs,
    fontWeight: '500',
    color: GeistColors.gray600,
    marginTop: GeistSpacing.md,
    marginBottom: GeistSpacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewContainer: {
    maxHeight: 200,
    marginBottom: GeistSpacing.md,
  },
  previewCard: {
    borderWidth: 1,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.sm,
    padding: GeistSpacing.sm,
    marginBottom: GeistSpacing.sm,
  },
  previewLabel: {
    fontSize: GeistFontSizes.xs,
    color: GeistColors.gray500,
    marginBottom: 2,
  },
  previewText: {
    fontSize: GeistFontSizes.sm,
    color: GeistColors.foreground,
    marginBottom: GeistSpacing.xs,
  },
});

export default ImportExportModal;
