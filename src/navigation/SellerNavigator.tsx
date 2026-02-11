import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme';
import SellerDashboardScreen from '../screens/seller/SellerDashboardScreen';
import ManageProductsScreen from '../screens/seller/ManageProductsScreen';
import SellerOrdersScreen from '../screens/seller/SellerOrdersScreen';
import StoreSettingsScreen from '../screens/seller/StoreSettingsScreen';
import Icon from '../components/ui/Icon';

export type SellerTabParamList = {
    Dashboard: undefined;
    Inventory: undefined;
    SellerOrders: undefined;
    Account: undefined;
};

const Tab = createBottomTabNavigator<SellerTabParamList>();

const SellerNavigator = () => {
    const { t } = useTranslation();

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
                    tabBarLabel: t('navigation.home'),
                    tabBarIcon: ({ size, focused, color }) => (
                        <Icon name={focused ? "dashboard-filled" : "dashboard"} size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Inventory"
                component={ManageProductsScreen}
                options={{
                    tabBarLabel: t('navigation.inventory'),
                    tabBarIcon: ({ size, focused, color }) => (
                        <Icon name={focused ? "package-filled" : "package"} size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="SellerOrders"
                component={SellerOrdersScreen}
                options={{
                    tabBarLabel: t('navigation.orders'),
                    tabBarIcon: ({ size, focused, color }) => (
                        <Icon name={focused ? "orders-filled" : "orders"} size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Account"
                component={StoreSettingsScreen}
                options={{
                    tabBarLabel: t('navigation.account'),
                    tabBarIcon: ({ size, color }) => (
                        <Icon name="settings" size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default SellerNavigator;
