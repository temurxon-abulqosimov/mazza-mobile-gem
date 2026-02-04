import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, Text, View } from 'react-native';
import { colors } from '../theme';
import SellerDashboardScreen from '../screens/seller/SellerDashboardScreen';
import ManageProductsScreen from '../screens/seller/ManageProductsScreen';
import SellerOrdersScreen from '../screens/seller/SellerOrdersScreen';
import StoreSettingsScreen from '../screens/seller/StoreSettingsScreen';

export type SellerTabParamList = {
    Dashboard: undefined;
    Inventory: undefined;
    Wallet: undefined;
    Account: undefined;
};

const Tab = createBottomTabNavigator<SellerTabParamList>();

const SellerNavigator = () => {
    return (
        <Tab.Navigator
            id="SellerTabs"
            screenOptions={{
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.text.tertiary,
                tabBarStyle: {
                    height: Platform.OS === 'ios' ? 88 : 68,
                    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
                    paddingTop: 8,
                    borderTopWidth: 1,
                    borderTopColor: colors.divider,
                    backgroundColor: colors.card,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={SellerDashboardScreen}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ size, color }) => (
                        <Text style={{ fontSize: size, color }}>🏠</Text>
                    ),
                }}
            />
            <Tab.Screen
                name="Inventory"
                component={ManageProductsScreen}
                options={{
                    tabBarLabel: 'Inventory',
                    tabBarIcon: ({ size, color }) => (
                        <Text style={{ fontSize: size, color }}>📦</Text>
                    ),
                }}
            />
            {/* Wallet / Finance - Using Orders for now as placeholder or combined view */}
            <Tab.Screen
                name="Wallet"
                component={SellerOrdersScreen}
                options={{
                    tabBarLabel: 'Wallet',
                    tabBarIcon: ({ size, color }) => (
                        <Text style={{ fontSize: size, color }}>💰</Text>
                    ),
                }}
            />
            <Tab.Screen
                name="Account"
                component={StoreSettingsScreen}
                options={{
                    tabBarLabel: 'Account',
                    tabBarIcon: ({ size, color }) => (
                        <Text style={{ fontSize: size, color }}>⚙️</Text>
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default SellerNavigator;
