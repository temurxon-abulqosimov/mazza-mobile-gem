import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DiscoveryStackParamList } from '../../navigation/types';
import { colors, spacing, typography, shadows } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import ReviewsList from '../../components/ReviewsList';
import { useFollowStore } from '../../hooks/useFollowStore';
import { useStore } from '../../hooks/useStore';

type StoreProfileRouteProp = RouteProp<DiscoveryStackParamList, 'StoreProfile'>;
type StoreProfileNavigationProp = NativeStackNavigationProp<DiscoveryStackParamList, 'StoreProfile'>;

const StoreProfileScreen = () => {
    const route = useRoute<StoreProfileRouteProp>();
    const navigation = useNavigation<StoreProfileNavigationProp>();
    const { storeId, storeName, storeImage, storeAddress, storeRating } = route.params;

    const { store, isLoading: isStoreLoading } = useStore(storeId);
    const { follow, unfollow, isFollowingLoading } = useFollowStore();
    const [isFollowing, setIsFollowing] = useState(false);

    // Sync follow state when store data loads
    useEffect(() => {
        if (store?.isFollowing !== undefined) {
            setIsFollowing(store.isFollowing);
        }
    }, [store]);

    const handleFollowToggle = () => {
        // Optimistic update
        const newState = !isFollowing;
        setIsFollowing(newState);

        const handleMutationError = (error: any) => {
            setIsFollowing(!newState); // Revert on error
            console.error('Follow/Unfollow error:', error);

            // Check for 401 Unauthorized
            if (error?.response?.status === 401 || error?.message?.includes('401')) {
                Alert.alert(
                    'Login Required',
                    'You need to be logged in to follow stores.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Login',
                            onPress: () => {
                                // @ts-ignore - Login is in RootNavigator
                                navigation.navigate('Login');
                            }
                        }
                    ]
                );
            } else {
                Alert.alert('Error', `Failed to ${newState ? 'follow' : 'unfollow'} store`);
            }
        };

        if (newState) {
            follow(storeId, {
                onError: handleMutationError,
            });
        } else {
            unfollow(storeId, {
                onError: handleMutationError,
            });
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Image
                    source={{ uri: storeImage || 'https://via.placeholder.com/400' }}
                    style={styles.coverImage}
                />
                <View style={styles.headerOverlay} />
                <View style={styles.headerContent}>
                    <View style={styles.headerRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.storeName}>{storeName}</Text>
                            <View style={styles.ratingContainer}>
                                <Ionicons name="star" size={16} color="#FFD700" />
                                <Text style={styles.ratingText}>{storeRating?.toFixed(1) || 'N/A'}</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={[styles.followButton, isFollowing && styles.followingButton]}
                            onPress={handleFollowToggle}
                            disabled={isFollowingLoading}
                        >
                            {isFollowingLoading ? (
                                <ActivityIndicator size="small" color={isFollowing ? colors.primary : "white"} />
                            ) : (
                                <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
                                    {isFollowing ? 'Following' : 'Follow'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.address}>
                        <Ionicons name="location-outline" size={16} color={colors.text.secondary} />
                        {' '}{storeAddress || 'Address not available'}
                    </Text>
                </View>

                <View style={styles.divider} />

                <ReviewsList storeId={storeId} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        height: 200,
        backgroundColor: colors.primary,
        position: 'relative',
    },
    coverImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    headerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    headerContent: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    storeName: {
        ...typography.h2,
        color: 'white',
        marginBottom: spacing.xs,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    followButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: spacing.radiusLg,
        minWidth: 100,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xs,
    },
    followingButton: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: colors.primary,
    },
    followButtonText: {
        ...typography.button,
        color: 'white',
        fontWeight: '600',
    },
    followingButtonText: {
        color: colors.primary,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    ratingText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 4,
        fontSize: 12,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.lg,
        paddingBottom: 40,
    },
    infoSection: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        ...typography.h4,
        marginBottom: spacing.sm,
        color: colors.text.primary,
    },
    address: {
        ...typography.body,
        color: colors.text.secondary,
    },
    divider: {
        height: 1,
        backgroundColor: colors.divider,
        marginVertical: spacing.md,
    },
});

export default StoreProfileScreen;
