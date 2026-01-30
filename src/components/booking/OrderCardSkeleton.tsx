import React from 'react';
import { View, StyleSheet } from 'react-native';

const OrderCardSkeleton = () => {
    return (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <View style={styles.infoContainer}>
                    <View style={styles.statusBadge} />
                    <View style={styles.textLineLg} />
                    <View style={styles.textLineSm} />
                    <View style={styles.priceLine} />
                </View>
                <View style={styles.image} />
            </View>
            <View style={styles.footer}>
                <View style={styles.button} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    cardContent: {
        flexDirection: 'row',
        padding: 16,
    },
    infoContainer: {
        flex: 1,
    },
    statusBadge: {
        width: 120,
        height: 24,
        borderRadius: 20,
        backgroundColor: '#EAEAEA',
    },
    textLineLg: {
        width: '70%',
        height: 20,
        borderRadius: 4,
        backgroundColor: '#EAEAEA',
        marginTop: 12,
    },
    textLineSm: {
        width: '50%',
        height: 14,
        borderRadius: 4,
        backgroundColor: '#EAEAEA',
        marginVertical: 8,
    },
    priceLine: {
        width: '30%',
        height: 20,
        borderRadius: 4,
        backgroundColor: '#EAEAEA',
        marginTop: 8,
    },
    image: {
        width: 90,
        height: 90,
        borderRadius: 12,
        marginLeft: 16,
        backgroundColor: '#EAEAEA',
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        padding: 16,
    },
    button: {
        height: 48,
        borderRadius: 12,
        backgroundColor: '#EAEAEA',
    },
});

export default OrderCardSkeleton;
