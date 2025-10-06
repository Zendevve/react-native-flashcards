import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, TabParamList } from '../types/navigation';
import { GeistColors, GeistBorders, GeistShadows, GeistSpacing } from '../theme/geist';

// Screens
const HomeScreen = require('../screens/HomeScreen').default;
const DeckDetailScreen = require('../screens/DeckDetailScreen').default;
const CardListScreen = require('../screens/CardListScreen').default;
const StudyScreen = require('../screens/StudyScreen').default;
const SettingsScreen = require('../screens/SettingsScreen').default;
const DeckSettingsScreen = require('../screens/DeckSettingsScreen').default;

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'library' : 'library-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          // Neo-brutalist icon container
          return (
            <View style={[
              styles.iconContainer,
              focused && styles.iconContainerActive
            ]}>
              <Ionicons name={iconName} size={22} color={color} />
            </View>
          );
        },
        tabBarActiveTintColor: GeistColors.foreground,
        tabBarInactiveTintColor: GeistColors.gray600,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Decks' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    paddingHorizontal: GeistSpacing.md,
    paddingVertical: GeistSpacing.xs,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  iconContainerActive: {
    backgroundColor: GeistColors.violetLight,
    borderWidth: GeistBorders.medium,
    borderColor: GeistColors.border,
  },
  tabBar: {
    backgroundColor: GeistColors.surface,
    borderTopWidth: GeistBorders.thick,
    borderTopColor: GeistColors.border,
    height: 65,
    paddingTop: GeistSpacing.sm,
    paddingBottom: GeistSpacing.sm,
    ...GeistShadows.md,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },
});

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="MainTabs" 
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="DeckDetail" 
          component={DeckDetailScreen}
          options={{ title: 'Deck Details' }}
        />
        <Stack.Screen 
          name="CardList" 
          component={CardListScreen}
          options={{ title: 'Cards' }}
        />
        <Stack.Screen 
          name="Study" 
          component={StudyScreen}
          options={{ 
            title: 'Study Session',
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="DeckSettings" 
          component={DeckSettingsScreen}
          options={{ title: 'Deck Settings' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
