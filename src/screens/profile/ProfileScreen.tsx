import React from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, ScrollView, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useAuth } from '../../hooks/useAuth';
import { ProfileStackParamList } from '../../navigation/ProfileNavigator';
import { UserRole } from '../../domain/enums/UserRole';

type ProfileNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'ProfileHome'>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileNavigationProp>();
  const { userProfile, isLoading, isError, refetch } = useUserProfile();
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: () => logout() }
    ]);
  }

  if (isLoading) {
    return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
  }

  if (isError || !userProfile) {
    return (
      <View style={styles.centered}>
        <Text>Could not load profile.</Text>
        <Button title="Retry" onPress={() => refetch()} />
      </View>
    );
  }

  const canBecomeSeller = userProfile.role === UserRole.BUYER;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: userProfile.avatarUrl || 'https://via.placeholder.com/100' }} style={styles.avatar} />
        <Text style={styles.fullName}>{userProfile.fullName}</Text>
        <Text style={styles.email}>{userProfile.email}</Text>
        <Text style={styles.memberSince}>Member since {new Date(userProfile.memberSince).toLocaleDateString()}</Text>
      </View>

      <View style={styles.gamificationSection}>
        <Text style={styles.levelName}>{userProfile.level.name} Food Saver</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${userProfile.level.progress}%` }]} />
        </View>
      </View>
      
      <View style={styles.statsContainer}>
          <StatCard label="Meals Saved" value={userProfile.stats.mealsSaved} />
          <StatCard label="CO2 Prevented (kg)" value={userProfile.stats.co2Prevented.toFixed(1)} />
          <StatCard label="Money Saved" value={`$${userProfile.stats.moneySaved.toFixed(2)}`} />
      </View>

      <View style={styles.actions}>
        {canBecomeSeller && <Button title="Become a Seller" onPress={() => navigation.navigate('BecomeSeller')} />}
        <Button title="Settings" onPress={() => navigation.navigate('Settings')} />
        <Button title="Logout" onPress={handleLogout} color="red" />
      </View>
    </ScrollView>
  );
};

const StatCard = ({ label, value }: { label: string; value: string | number }) => (
    <View style={styles.statCard}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  fullName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  memberSince: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  gamificationSection: {
      padding: 20,
      alignItems: 'center',
  },
  levelName: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
  },
  progressBarContainer: {
      height: 20,
      width: '80%',
      backgroundColor: '#e0e0e0',
      borderRadius: 10,
  },
  progressBar: {
      height: '100%',
      backgroundColor: '#4CAF50',
      borderRadius: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  statCard: {
      backgroundColor: 'white',
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      width: '30%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
  },
  statValue: {
      fontSize: 20,
      fontWeight: 'bold',
  },
  statLabel: {
      fontSize: 12,
      color: '#666',
      marginTop: 4,
      textAlign: 'center',
  },
  actions: {
    padding: 20,
    marginTop: 20,
    gap: 10
  }
});

export default ProfileScreen;