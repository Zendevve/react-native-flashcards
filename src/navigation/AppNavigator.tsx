import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, TabParamList } from '../types/navigation';

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
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'My Decks' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

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
