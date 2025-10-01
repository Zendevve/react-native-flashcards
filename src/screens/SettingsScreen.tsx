import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

const SettingsScreen = () => {
  const { isPhone } = useResponsive();
  const isMobile = isPhone;

  type SettingItem = {
    icon?: keyof typeof Ionicons.glyphMap | null;
    label: string;
    value?: string;
  };

  type SettingsSection = {
    title: string;
    items: SettingItem[];
  };

  const sections: SettingsSection[] = [
    {
      title: 'General',
      items: [
        { icon: 'moon-outline' as const, label: 'Dark Theme' },
        { icon: 'notifications-outline' as const, label: 'Notifications' },
      ],
    },
    {
      title: 'Data',
      items: [
        { icon: 'cloud-upload-outline' as const, label: 'Backup' },
        { icon: 'cloud-download-outline' as const, label: 'Restore' },
        { icon: 'download-outline' as const, label: 'Import CSV' },
      ],
    },
    {
      title: 'About',
      items: [
        { icon: null, label: 'Version', value: '1.0.0' },
        { icon: 'information-circle-outline' as const, label: 'Help & Support' },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}> 
      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item, index) => {
            const isLast = index === section.items.length - 1;
            if (item.value) {
              return (
                <View key={item.label} style={[styles.settingItem, isLast && styles.settingItemLast]}>
                  <Text style={styles.settingText}>{item.label}</Text>
                  <Text style={styles.settingValue}>{item.value}</Text>
                </View>
              );
            }

            return (
              <TouchableOpacity
                key={item.label}
                style={[styles.settingItem, isLast && styles.settingItemLast]}
                activeOpacity={0.7}
              >
                <View style={styles.settingLeft}>
                  {item.icon && (
                    <View style={styles.settingIconWrapper}>
                      <Ionicons name={item.icon} size={20} color={GeistColors.foreground} />
                    </View>
                  )}
                  <Text style={styles.settingText}>{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={GeistColors.gray500} />
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
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
    paddingBottom: GeistSpacing.xxl,
    gap: GeistSpacing.lg,
  },
  section: {
    ...GeistComponents.card.default,
    backgroundColor: GeistColors.surface,
    borderRadius: GeistBorderRadius.lg,
    paddingHorizontal: 0,
    paddingVertical: 0,
    gap: 0,
  },
  sectionTitle: {
    ...GeistTypography.caption,
    color: GeistColors.gray700,
    paddingHorizontal: GeistSpacing.lg,
    paddingTop: GeistSpacing.lg,
    paddingBottom: GeistSpacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: GeistSpacing.md,
    paddingHorizontal: GeistSpacing.lg,
    borderTopWidth: GeistBorders.medium,
    borderTopColor: GeistColors.border,
    minHeight: 56,
    backgroundColor: GeistColors.surface,
  },
  settingItemLast: {
    borderBottomLeftRadius: GeistBorderRadius.lg,
    borderBottomRightRadius: GeistBorderRadius.lg,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GeistSpacing.sm,
  },
  settingIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: GeistBorderRadius.md,
    borderWidth: GeistBorders.medium,
    borderColor: GeistColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GeistColors.surface,
    ...GeistShadows.sm,
  },
  settingText: {
    ...GeistTypography.bodyStrong,
    color: GeistColors.foreground,
  },
  settingValue: {
    ...GeistTypography.body,
    color: GeistColors.gray600,
  },
});

export default SettingsScreen;
