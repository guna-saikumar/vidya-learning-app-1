import React from 'react';
import { View, Text, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LayoutDashboard, BookOpen, Layers, User } from 'lucide-react-native';
import { AdminTabParamList } from '../types/navigation';
import Colors from '../constants/colors';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ClassesScreen } from '../screens/ClassesScreen';
import { MaterialsLibraryScreen } from '../screens/MaterialsLibraryScreen';
import { ProfileSettingsScreen } from '../screens/ProfileSettingsScreen';

const Tab = createBottomTabNavigator<AdminTabParamList>();

export const TabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'ios' ? 18 : 8);

  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: 64 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        },
        tabBarIcon: ({ focused }) => {
          let icon;
          let label = '';
          const color = focused ? Colors.primary : Colors.textMuted;

          switch (route.name) {
            case 'Dashboard':
              icon = <LayoutDashboard size={20} color={color} />;
              label = 'Dashboard';
              break;
            case 'Curriculum':
              icon = <BookOpen size={20} color={color} />;
              label = 'Curriculum';
              break;
            case 'Materials':
              icon = <Layers size={20} color={color} />;
              label = 'Materials';
              break;
            case 'Profile':
              icon = <User size={20} color={color} />;
              label = 'Settings';
              break;
          }

          return (
            <View className="items-center justify-center gap-1">
              <View
                className={`px-3.5 py-1 rounded-full ${
                  focused ? 'bg-palePeach' : 'bg-transparent'
                }`}
              >
                {icon}
              </View>
              <Text
                className={`font-manrope-bold text-[10px] ${
                  focused ? 'text-primary' : 'text-textMuted'
                }`}
              >
                {label}
              </Text>
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Curriculum" component={ClassesScreen} />
      <Tab.Screen name="Materials" component={MaterialsLibraryScreen} />
      <Tab.Screen name="Profile" component={ProfileSettingsScreen} />
    </Tab.Navigator>
  );
};
