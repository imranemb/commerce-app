import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import POSScreen from './screens/POSScreen';
import ProductScreen from './screens/ProductScreen';

import ScanTicket from './components/ScanTicket';
import SalesStatusScreen from './screens/SalesStatusScreen';
import DashboardScreen from './screens/DashboardScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator initialRouteName="Dashboard" screenOptions={({ route,  }) => ({
        headerShown: false,
    tabBarIcon: ({ focused, color, size }) => {
      let iconName;

      switch (route.name) {
        case 'Dashboard':
          iconName = focused ? 'home' : 'home-outline';
          break;
        case 'Inventaire':
          iconName = focused ? 'cube' : 'cube-outline';
          break;
        case 'Scanner':
          iconName = focused ? 'qr-code' : 'qr-code-outline';
          break;
        case 'POS':
          iconName = focused ? 'cash' : 'cash-outline';
          break;
        case 'Status des commandes':
          iconName = focused ? 'clipboard' : 'clipboard-outline';
          break;
        default:
          iconName = 'ellipse';
      }

      return <Ionicons name={iconName} size={size} color={color} />;
    },
    tabBarActiveTintColor: '#007AFF',
    tabBarInactiveTintColor: 'gray',
  })}
>
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Inventaire" component={ProductScreen} />
     
        <Tab.Screen name="Scanner" component={ScanTicket} />
        <Tab.Screen name="POS" component={POSScreen} />
        <Tab.Screen name="Status des commandes" component={SalesStatusScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

