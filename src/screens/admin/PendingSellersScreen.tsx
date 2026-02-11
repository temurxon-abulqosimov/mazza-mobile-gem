import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';

interface PendingSeller {
  id: string;
  userId: string;
  businessName: string;
  description: string;
  address: string;
  city: string;
  businessPhone: string | null;
  appliedAt: string;
  user: {
    email: string;
    fullName: string;
  };
}

const PendingSellersScreen = () => {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data: response, isLoading } = useQuery({
    queryKey: ['pendingSellers'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/sellers/pending');
      return data.data as { sellers: PendingSeller[]; total: number; nextCursor?: string };
    },
  });

  const sellers = response?.sellers || [];

  const approveMutation = useMutation({
    mutationFn: async (sellerId: string) => {
      await apiClient.post(`/admin/sellers/${sellerId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingSellers'] });
      Alert.alert('Success', 'Seller approved successfully!');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to approve seller');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ sellerId, reason }: { sellerId: string; reason: string }) => {
      await apiClient.post(`/admin/sellers/${sellerId}/reject`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingSellers'] });
      Alert.alert('Success', 'Seller application rejected');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to reject seller');
    },
  });

  const handleApprove = (sellerId: string) => {
    Alert.alert(
      'Approve Seller',
      'Are you sure you want to approve this seller application?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Approve', onPress: () => approveMutation.mutate(sellerId) },
      ]
    );
  };

  const handleReject = (sellerId: string) => {
    Alert.prompt(
      'Reject Seller',
      'Please provide a reason for rejection:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          onPress: (reason) => {
            if (reason && reason.trim()) {
              rejectMutation.mutate({ sellerId, reason: reason.trim() });
            } else {
              Alert.alert('Error', 'Please provide a rejection reason');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['pendingSellers'] });
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B35']} />}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pending Seller Applications</Text>
        <Text style={styles.headerSubtitle}>{sellers.length} applications waiting</Text>
      </View>

      {sellers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No pending applications</Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {sellers.map((seller) => (
            <View key={seller.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.businessName}>{seller.businessName}</Text>
                <Text style={styles.date}>
                  {new Date(seller.appliedAt).toLocaleDateString()}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Owner:</Text>
                <Text style={styles.value}>{seller.user.fullName}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Phone:</Text>
                <Text style={styles.value}>{seller.user.phoneNumber || seller.user.email || '—'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Location:</Text>
                <Text style={styles.value}>{seller.city}, {seller.address}</Text>
              </View>

              {seller.businessPhone && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Phone:</Text>
                  <Text style={styles.value}>{seller.businessPhone}</Text>
                </View>
              )}

              <View style={styles.descriptionContainer}>
                <Text style={styles.label}>Description:</Text>
                <Text style={styles.description}>{seller.description}</Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.button, styles.rejectButton]}
                  onPress={() => handleReject(seller.id)}
                  disabled={rejectMutation.isPending}
                >
                  <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.approveButton]}
                  onPress={() => handleApprove(seller.id)}
                  disabled={approveMutation.isPending}
                >
                  {approveMutation.isPending ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.approveButtonText}>Approve</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FF6B35',
    padding: 24,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 80,
  },
  value: {
    fontSize: 14,
    color: '#1a1a1a',
    flex: 1,
  },
  descriptionContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#1a1a1a',
    marginTop: 4,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  approveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  rejectButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PendingSellersScreen;
