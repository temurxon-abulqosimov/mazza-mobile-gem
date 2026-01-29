import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Button, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUserBookings } from '../../hooks/useUserBookings';
import { OrdersStackParamList } from '../../navigation/OrdersNavigator';
import OrderCard from '../../components/booking/OrderCard';

type NavigationProp = NativeStackNavigationProp<OrdersStackParamList, 'OrderList'>;

const OrderHistoryScreen = () => {
  const [status, setStatus] = useState<'active' | 'past'>('active');
  const navigation = useNavigation<NavigationProp>();
  const { 
    bookings, 
    isLoading, 
    isError, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    refetch 
  } = useUserBookings({ status });

  const ListEmptyComponent = () => (
    <View style={styles.centered}>
      <Text>No {status} orders found.</Text>
    </View>
  );

  const ListFooterComponent = () => {
    if (isFetchingNextPage) {
      return <ActivityIndicator style={{ margin: 20 }} />;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Orders</Text>
      </View>
      <View style={styles.tabContainer}>
        <TouchableOpacity 
            style={[styles.tab, status === 'active' && styles.activeTab]} 
            onPress={() => setStatus('active')}
        >
          <Text style={[styles.tabText, status === 'active' && styles.activeTabText]}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            style={[styles.tab, status === 'past' && styles.activeTab]} 
            onPress={() => setStatus('past')}
        >
          <Text style={[styles.tabText, status === 'past' && styles.activeTabText]}>Past</Text>
        </TouchableOpacity>
      </View>

      {isLoading && bookings.length === 0 ? (
        <View style={styles.centered}><ActivityIndicator size="large" /></View>
      ) : isError ? (
        <View style={styles.centered}>
            <Text>Could not load orders.</Text>
            <Button title="Retry" onPress={() => refetch()}/>
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={({ item }) => (
            <OrderCard 
              booking={item} 
              onPress={() => navigation.navigate('OrderDetail', { bookingId: item.id })}
            />
          )}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={ListEmptyComponent}
          ListFooterComponent={ListFooterComponent}
          onEndReached={() => {
            if (hasNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          onRefresh={refetch}
          refreshing={isLoading}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 16,
        backgroundColor: 'white',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: 'white',
        paddingBottom: 10,
    },
    tab: {
        padding: 10,
        borderRadius: 20,
    },
    activeTab: {
        backgroundColor: '#333',
    },
    tabText: {
        fontWeight: '600',
        color: '#666',
    },
    activeTabText: {
        color: '#fff',
    }
});

export default OrderHistoryScreen;