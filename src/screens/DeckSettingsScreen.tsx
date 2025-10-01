import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
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
  GeistComponents,
  GeistTypography,
  GeistShadows,
} from '../theme/geist';
import { useResponsive } from '../hooks/useResponsive';
import { DeckSettings, INTERVAL_PRESETS } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DeckSettings'>;
type RouteProps = RouteProp<RootStackParamList, 'DeckSettings'>;

const DeckSettingsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { deckId } = route.params;

  const { currentDeck, loadDeck, updateDeck } = useStore();
  const { isPhone } = useResponsive();
  const isMobile = isPhone;
  const [settings, setSettings] = useState<DeckSettings | null>(null);

  useEffect(() => {
    loadDeck(deckId);
  }, [deckId]);

  useEffect(() => {
    if (currentDeck) {
      setSettings(currentDeck.settings);
    }
  }, [currentDeck]);

  if (!currentDeck || !settings) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const handleSave = async () => {
    try {
      await updateDeck(deckId, { settings });
      Alert.alert('Success', 'Settings saved successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
      console.error(error);
    }
  };

  const handlePresetSelect = (presetName: string) => {
    const preset = INTERVAL_PRESETS[presetName];
    if (preset) {
      setSettings({
        ...settings,
        intervalScheme: presetName,
        customIntervals: preset,
      });
    }
  };

  const updateSetting = <K extends keyof DeckSettings>(key: K, value: DeckSettings[K]) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Interval Scheme Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Spaced Repetition</Text>
        <Text style={styles.label}>Interval Scheme</Text>
        <View style={[styles.presetButtons, isMobile && styles.presetButtonsMobile]}>
          {Object.keys(INTERVAL_PRESETS).map((preset) => (
            <TouchableOpacity
              key={preset}
              style={[
                styles.presetButton,
                settings.intervalScheme === preset && styles.presetButtonActive,
              ]}
              onPress={() => handlePresetSelect(preset)}
            >
              <Text
                style={[
                  styles.presetButtonText,
                  settings.intervalScheme === preset && styles.presetButtonTextActive,
                ]}
              >
                {preset.charAt(0).toUpperCase() + preset.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {settings.intervalScheme === 'custom' && (
          <View style={styles.customIntervals}>
            <Text style={styles.label}>Custom Intervals (days)</Text>
            <Text style={styles.helperText}>
              Comma-separated values (e.g., 1, 3, 7, 14, 30)
            </Text>
            <TextInput
              style={styles.input}
              value={settings.customIntervals.join(', ')}
              onChangeText={(text) => {
                const intervals = text
                  .split(',')
                  .map((s) => parseInt(s.trim()))
                  .filter((n) => !isNaN(n));
                updateSetting('customIntervals', intervals);
              }}
              placeholder="1, 3, 7, 14, 30"
              placeholderTextColor={GeistColors.gray400}
            />
          </View>
        )}

        <View style={[styles.settingRow, isMobile && styles.settingRowMobile]}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingLabel}>New Cards Per Day</Text>
            <Text style={styles.settingHelper}>Maximum new cards to introduce daily</Text>
          </View>
          <TextInput
            style={styles.numberInput}
            value={settings.newCardsPerDay.toString()}
            onChangeText={(text) => updateSetting('newCardsPerDay', parseInt(text) || 20)}
            keyboardType="number-pad"
            placeholderTextColor={GeistColors.gray400}
          />
        </View>

        <View style={[styles.settingRow, isMobile && styles.settingRowMobile]}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingLabel}>Review Cards Per Day</Text>
            <Text style={styles.settingHelper}>Maximum reviews per day</Text>
          </View>
          <TextInput
            style={styles.numberInput}
            value={settings.reviewCardsPerDay.toString()}
            onChangeText={(text) => updateSetting('reviewCardsPerDay', parseInt(text) || 100)}
            keyboardType="number-pad"
            placeholderTextColor={GeistColors.gray400}
          />
        </View>
      </View>

      {/* Language Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Languages</Text>

        <View style={[styles.settingRow, isMobile && styles.settingRowMobile]}>
          <Text style={styles.settingLabel}>Question Language</Text>
          <TextInput
            style={styles.languageInput}
            value={settings.questionLanguage}
            onChangeText={(text) => updateSetting('questionLanguage', text)}
            placeholder="en-US"
            placeholderTextColor={GeistColors.gray400}
          />
        </View>

        <View style={[styles.settingRow, isMobile && styles.settingRowMobile]}>
          <Text style={styles.settingLabel}>Answer Language</Text>
          <TextInput
            style={styles.languageInput}
            value={settings.answerLanguage}
            onChangeText={(text) => updateSetting('answerLanguage', text)}
            placeholder="en-US"
            placeholderTextColor={GeistColors.gray400}
          />
        </View>
      </View>

      {/* Text-to-Speech Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Text-to-Speech</Text>

        <View style={[styles.settingRow, isMobile && styles.settingRowMobile]}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingLabel}>Auto-speak Question</Text>
            <Text style={styles.settingHelper}>Automatically read question aloud</Text>
          </View>
          <Switch
            value={settings.autoSpeakQuestion}
            onValueChange={(value) => updateSetting('autoSpeakQuestion', value)}
            trackColor={{ false: GeistColors.gray300, true: GeistColors.foreground }}
            thumbColor={GeistColors.background}
          />
        </View>

        <View style={[styles.settingRow, isMobile && styles.settingRowMobile]}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingLabel}>Auto-speak Answer</Text>
            <Text style={styles.settingHelper}>Automatically read answer aloud</Text>
          </View>
          <Switch
            value={settings.autoSpeakAnswer}
            onValueChange={(value) => updateSetting('autoSpeakAnswer', value)}
            trackColor={{ false: GeistColors.gray300, true: GeistColors.foreground }}
            thumbColor={GeistColors.background}
          />
        </View>
      </View>

      {/* Card Display Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Card Display</Text>

        <View style={[styles.settingRow, isMobile && styles.settingRowMobile]}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingLabel}>Shuffle Cards</Text>
            <Text style={styles.settingHelper}>Randomize card order during study</Text>
          </View>
          <Switch
            value={settings.shuffleCards}
            onValueChange={(value) => updateSetting('shuffleCards', value)}
            trackColor={{ false: GeistColors.gray300, true: GeistColors.foreground }}
            thumbColor={GeistColors.background}
          />
        </View>

        <View style={[styles.settingRow, isMobile && styles.settingRowMobile]}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingLabel}>Invert Cards</Text>
            <Text style={styles.settingHelper}>Swap question and answer sides</Text>
          </View>
          <Switch
            value={settings.cardInverted}
            onValueChange={(value) => updateSetting('cardInverted', value)}
            trackColor={{ false: GeistColors.gray300, true: GeistColors.foreground }}
            thumbColor={GeistColors.background}
          />
        </View>

        <View style={[styles.settingRow, isMobile && styles.settingRowMobile]}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingLabel}>Enable Hints</Text>
            <Text style={styles.settingHelper}>Show partial answer as hint</Text>
          </View>
          <Switch
            value={settings.enableHints}
            onValueChange={(value) => updateSetting('enableHints', value)}
            trackColor={{ false: GeistColors.gray300, true: GeistColors.foreground }}
            thumbColor={GeistColors.background}
          />
        </View>

        {settings.enableHints && (
          <View style={[styles.settingRow, isMobile && styles.settingRowMobile]}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Hint Masking Level</Text>
              <Text style={styles.settingHelper}>Percentage of answer to hide</Text>
            </View>
            <View style={styles.segmentedControl}>
              {[25, 50, 75].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.segment,
                    settings.hintMaskingLevel === level && styles.segmentActive,
                  ]}
                  onPress={() => updateSetting('hintMaskingLevel', level)}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      settings.hintMaskingLevel === level && styles.segmentTextActive,
                    ]}
                  >
                    {level}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Study Mode Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Study Mode</Text>

        <View style={styles.modeButtons}>
          {(['flashcard', 'multiple-choice', 'typing'] as const).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.modeButton,
                settings.studyMode === mode && styles.modeButtonActive,
              ]}
              onPress={() => updateSetting('studyMode', mode)}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  settings.studyMode === mode && styles.modeButtonTextActive,
                ]}
              >
                {mode === 'flashcard' ? 'Flashcard' : mode === 'multiple-choice' ? 'Multiple Choice' : 'Typing'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Timer Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Timer</Text>

        <View style={[styles.settingRow, isMobile && styles.settingRowMobile]}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingLabel}>Enable Timer</Text>
            <Text style={styles.settingHelper}>Show countdown timer during study</Text>
          </View>
          <Switch
            value={settings.enableTimer}
            onValueChange={(value) => updateSetting('enableTimer', value)}
            trackColor={{ false: GeistColors.gray300, true: GeistColors.foreground }}
            thumbColor={GeistColors.background}
          />
        </View>

        {settings.enableTimer && (
          <View style={[styles.settingRow, isMobile && styles.settingRowMobile]}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Timer Duration (seconds)</Text>
              <Text style={styles.settingHelper}>Time limit per card</Text>
            </View>
            <TextInput
              style={styles.numberInput}
              value={settings.timerDuration.toString()}
              onChangeText={(text) => updateSetting('timerDuration', parseInt(text) || 30)}
              keyboardType="number-pad"
              placeholderTextColor={GeistColors.gray400}
            />
          </View>
        )}
      </View>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Ionicons name="save" size={20} color={GeistColors.foreground} />
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GeistColors.canvas,
  },
  content: {
    paddingHorizontal: GeistSpacing.lg,
    paddingBottom: GeistSpacing.xxxl,
    gap: GeistSpacing.lg,
  },
  section: {
    ...GeistComponents.card.spacious,
    backgroundColor: GeistColors.surface,
    gap: GeistSpacing.md,
  },
  sectionTitle: {
    ...GeistTypography.caption,
    color: GeistColors.gray700,
  },
  label: {
    ...GeistTypography.bodyStrong,
    color: GeistColors.foreground,
  },
  helperText: {
    ...GeistTypography.caption,
    color: GeistColors.gray600,
  },
  presetButtons: {
    flexDirection: 'row',
    gap: GeistSpacing.sm,
    marginBottom: GeistSpacing.md,
  },
  presetButtonsMobile: {
    flexWrap: 'wrap',
  },
  presetButton: {
    flex: 1,
    minWidth: 120,
    ...GeistComponents.button.outline,
    backgroundColor: GeistColors.surface,
  },
  presetButtonActive: {
    backgroundColor: GeistColors.violet,
    borderColor: GeistColors.border,
  },
  presetButtonText: {
    ...GeistTypography.button,
    color: GeistColors.foreground,
  },
  presetButtonTextActive: {
    color: GeistColors.foreground,
  },
  customIntervals: {
    marginBottom: GeistSpacing.md,
    gap: GeistSpacing.xs,
  },
  input: {
    ...GeistComponents.input,
    color: GeistColors.foreground,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: GeistSpacing.md,
    borderTopWidth: GeistBorders.medium,
    borderTopColor: GeistColors.border,
  },
  settingRowMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: GeistSpacing.sm,
  },
  settingLeft: {
    flex: 1,
    marginRight: GeistSpacing.md,
    gap: GeistSpacing.xs,
  },
  settingLabel: {
    ...GeistTypography.bodyStrong,
    color: GeistColors.foreground,
  },
  settingHelper: {
    ...GeistTypography.caption,
    color: GeistColors.gray600,
  },
  numberInput: {
    ...GeistComponents.input,
    width: 100,
    textAlign: 'center',
  },
  languageInput: {
    ...GeistComponents.input,
    width: 140,
    textAlign: 'center',
  },
  segmentedControl: {
    flexDirection: 'row',
    borderWidth: GeistBorders.medium,
    borderColor: GeistColors.border,
    borderRadius: GeistBorderRadius.sm,
    overflow: 'hidden',
    backgroundColor: GeistColors.surface,
  },
  segment: {
    paddingVertical: GeistSpacing.sm,
    paddingHorizontal: GeistSpacing.md,
    borderRightWidth: GeistBorders.medium,
    borderRightColor: GeistColors.border,
  },
  segmentActive: {
    backgroundColor: GeistColors.violet,
  },
  segmentText: {
    ...GeistTypography.button,
    color: GeistColors.foreground,
  },
  segmentTextActive: {
    color: GeistColors.foreground,
  },
  footer: {
    padding: GeistSpacing.lg,
    alignItems: 'center',
  },
  saveButton: {
    ...GeistComponents.button.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: GeistSpacing.sm,
    width: '100%',
  },
  saveButtonText: {
    ...GeistTypography.button,
    color: GeistColors.foreground,
  },
  modeButtons: {
    flexDirection: 'row',
    gap: GeistSpacing.sm,
  },
  modeButton: {
    flex: 1,
    ...GeistComponents.button.outline,
    backgroundColor: GeistColors.surface,
  },
  modeButtonActive: {
    backgroundColor: GeistColors.violet,
    borderColor: GeistColors.border,
  },
  modeButtonText: {
    ...GeistTypography.button,
    color: GeistColors.foreground,
  },
  modeButtonTextActive: {
    color: GeistColors.foreground,
  },
});

export default DeckSettingsScreen;
