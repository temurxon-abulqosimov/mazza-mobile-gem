import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SectionList, ActivityIndicator, Button, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useUserBookings } from '../../hooks/useUserBookings';
import { OrdersStackParamList } from '../../navigation/OrdersNavigator';
import { MainTabParamList } from '../../navigation/MainAppNavigator';
import { RootStackParamList } from '../../navigation/RootNavigator';
import OrderCard from '../../components/booking/OrderCard';
import { Booking, BookingStatus } from '../../domain/Booking';
import OrderCardSkeleton from '../../components/booking/OrderCardSkeleton';
import { useTranslation } from 'react-i18next';

type OrderHistoryNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<OrdersStackParamList, 'OrderList'>,
  CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList>,
    NativeStackNavigationProp<RootStackParamList>
  >
>;

interface BookingSection {
  title: string;
  data: Booking[];
}


const groupBookingsByDate = (bookings: Booking[], t: any): BookingSection[] => {
  const sections: { [key: string]: Booking[] } = {};

  bookings.forEach(booking => {
    const today = new Date();
    const bookingDate = new Date(booking.createdAt);
    const diffTime = today.getTime() - bookingDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let sectionTitle: string;
    if (booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.CANCELLED) {
      if (diffDays <= 1) {
        sectionTitle = t('orders.today');
      } else if (diffDays <= 2) {
        sectionTitle = t('orders.yesterday');
      } else {
        sectionTitle = bookingDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
      }
    } else {
      sectionTitle = t('orders.current_orders');
    }

    if (!sections[sectionTitle]) {
      sections[sectionTitle] = [];
    }
    sections[sectionTitle].push(booking);
  });

  const sectionOrder = [t('orders.current_orders'), t('orders.today'), t('orders.yesterday')];
  return Object.entries(sections).sort(([a], [b]) => {
    const indexA = sectionOrder.indexOf(a);
    const indexB = sectionOrder.indexOf(b);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    // For date-based titles, sort them chronologically if needed
    return 0;
  }).map(([title, data]) => ({ title, data }));
}

const LoadingComponent = () => (
  <View style={{ paddingHorizontal: 16 }}>
    <OrderCardSkeleton />
    <OrderCardSkeleton />
    <OrderCardSkeleton />
  </View>
);

const OrderHistoryScreen = () => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<'active' | 'past'>('active');
  const navigation = useNavigation<OrderHistoryNavigationProp>();
  const {
    bookings,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useUserBookings({ status });

  const sections = useMemo(() => groupBookingsByDate(bookings, t), [bookings, t]);

  const ListEmptyComponent = () => (
    <View style={styles.centered}>
      <Text style={styles.emptyText}>{t('orders.no_orders', { status })}</Text>
      <Text style={styles.emptySubText}>{t('orders.no_orders_subtitle')}</Text>
    </View>
  );

  const renderSectionHeader = ({ section: { title } }: { section: BookingSection }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, status === 'active' && styles.activeTab]}
          onPress={() => setStatus('active')}
        >
          <Text style={[styles.tabText, status === 'active' && styles.activeTabText]}>{t('orders.active')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, status === 'past' && styles.activeTab]}
          onPress={() => setStatus('past')}
        >
          <Text style={[styles.tabText, status === 'past' && styles.activeTabText]}>{t('orders.past')}</Text>
        </TouchableOpacity>
      </View>

      {isLoading && bookings.length === 0 ? (
        <LoadingComponent />
      ) : isError ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{t('orders.could_not_load')}</Text>
          <Button title={t('common.try_again')} onPress={() => refetch()} color="#FF7A00" />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OrderCard
              booking={item}
              onPress={() => navigation.navigate('OrderDetail', { bookingId: item.id })}
              onReviewPress={() => {
                navigation.navigate('AddReview', {
                  bookingId: item.id,
                  productId: item.product.id,
                  productName: item.product.name,
                  productImage: item.product.imageUrl,
                  storeName: item.store.name,
                });
              }}
            />
          )}
          renderSectionHeader={renderSectionHeader}
          ListEmptyComponent={ListEmptyComponent}
          ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={{ margin: 20 }} color="#FF7A00" /> : null}
          onEndReached={() => {
            if (hasNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          onRefresh={refetch}
          refreshing={isRefetching}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    marginBottom: 10,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FCFCFC',
    justifyContent: 'center',
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginHorizontal: 10,
    backgroundColor: '#F3F3F3',
  },
  activeTab: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#888',
  },
  activeTabText: {
    color: '#FF7A00',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#A0A0A0',
    textTransform: 'uppercase',
    marginTop: 24,
    marginBottom: 8,
  }
});

export default OrderHistoryScreen;