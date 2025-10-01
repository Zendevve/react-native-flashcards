import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GeistColors, GeistSpacing, GeistFontSizes, GeistBorderRadius } from '../theme/geist';

const SettingsScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General</Text>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="moon-outline" size={20} color={GeistColors.foreground} />
            <Text style={styles.settingText}>Dark Theme</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={GeistColors.gray400} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="notifications-outline" size={20} color={GeistColors.foreground} />
            <Text style={styles.settingText}>Notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={GeistColors.gray400} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="cloud-upload-outline" size={20} color={GeistColors.foreground} />
            <Text style={styles.settingText}>Backup</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={GeistColors.gray400} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="cloud-download-outline" size={20} color={GeistColors.foreground} />
            <Text style={styles.settingText}>Restore</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={GeistColors.gray400} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="download-outline" size={20} color={GeistColors.foreground} />
            <Text style={styles.settingText}>Import CSV</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={GeistColors.gray400} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Version</Text>
          <Text style={styles.settingValue}>1.0.0</Text>
        </View>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="information-circle-outline" size={20} color={GeistColors.foreground} />
            <Text style={styles.settingText}>Help & Support</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={GeistColors.gray400} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GeistColors.background,
  },
  section: {
    backgroundColor: GeistColors.background,
    marginTop: GeistSpacing.md,
    paddingHorizontal: GeistSpacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: GeistColors.border,
  },
  sectionTitle: {
    fontSize: GeistFontSizes.xs,
    fontWeight: '500',
    color: GeistColors.gray600,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingVertical: GeistSpacing.sm,
    paddingHorizontal: GeistSpacing.xs,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: GeistSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: GeistColors.border,
    minHeight: 56,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: GeistFontSizes.sm,
    color: GeistColors.foreground,
    marginLeft: GeistSpacing.sm,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  settingValue: {
    fontSize: GeistFontSizes.sm,
    color: GeistColors.gray500,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default SettingsScreen;
