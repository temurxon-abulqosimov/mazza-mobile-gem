import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, StatusBar, Dimensions, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography } from '../../theme';
import { useCompleteOrder } from '../../hooks/useCompleteOrder';
import Icon from '../../components/ui/Icon';

const { width, height } = Dimensions.get('window');
const SCAN_FRAME_SIZE = 280;
const VERIFICATION_TIMEOUT_MS = 20000;

const QRScannerScreen = () => {
    const navigation = useNavigation();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [torchEnabled, setTorchEnabled] = useState(false);
    const { completeOrderAsync, resetMutation } = useCompleteOrder();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isProcessingRef = useRef(false);

    // Camera permission check
    useEffect(() => {
        if (!permission) {
            requestPermission();
        }
    }, [permission]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const resetScanner = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        isProcessingRef.current = false;
        setScanned(false);
        setVerifying(false);
        resetMutation();
    }, [resetMutation]);

    if (!permission) {
        return <View style={styles.container} />; // Loading permissions
    }

    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <View style={styles.permissionContent}>
                    <Icon name="camera" size={64} color={colors.text.secondary} style={{ marginBottom: spacing.md }} />
                    <Text style={styles.permissionTitle}>Camera Access Required</Text>
                    <Text style={styles.permissionMessage}>We need permission to access your camera to scan QR codes.</Text>
                    <TouchableOpacity onPress={requestPermission} style={styles.primaryButton}>
                        <Text style={styles.primaryButtonText}>Grant Permission</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.secondaryButton}>
                        <Text style={styles.secondaryButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const handleBarCodeScanned = (scanResult: { data: string }) => {
        // Prevent duplicate scans using both state and ref
        if (scanned || isProcessingRef.current || verifying) return;

        const { data } = scanResult;
        console.log('[QRScanner] Barcode scanned, raw data:', data);

        setScanned(true);
        isProcessingRef.current = true;

        let bookingId: string | null = null;

        // 1. Try Parsing as JSON (main format: {"orderNumber":"...","bookingId":"..."})
        try {
            const parsedData = JSON.parse(data);
            if (parsedData && parsedData.bookingId) {
                bookingId = parsedData.bookingId;
            } else if (parsedData && parsedData.id) {
                bookingId = parsedData.id;
            }
        } catch (e) {
            // Not JSON, continue to other formats
        }

        // 2. Try MAZZA:ORDER_NUM:UUID format
        if (!bookingId) {
            const mazzaMatch = data.match(/^MAZZA:[^:]+:(.+)$/);
            if (mazzaMatch) {
                bookingId = mazzaMatch[1];
            }
        }

        // 3. Try Extracting UUID from any text
        if (!bookingId) {
            const uuidRegex = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
            const match = data.match(uuidRegex);
            if (match) {
                bookingId = match[0];
            }
        }

        // 4. Fallback
        if (!bookingId && data.length > 20 && !data.includes('http')) {
            bookingId = data;
        }

        if (!bookingId) {
            console.log('[QRScanner] Could not extract bookingId from QR data');
            isProcessingRef.current = false;
            Alert.alert(
                'Invalid QR Code',
                'We could not find a valid Booking ID in this QR code.',
                [{ text: 'Try Again', onPress: resetScanner }]
            );
            return;
        }

        console.log('[QRScanner] Extracted bookingId:', bookingId);

        // Show loading state immediately via local state
        setVerifying(true);

        // Set a safety timeout
        timeoutRef.current = setTimeout(() => {
            if (isProcessingRef.current) {
                console.log('[QRScanner] Request timed out');
                isProcessingRef.current = false;
                setVerifying(false);
                resetMutation();
                Alert.alert(
                    'Request Timeout',
                    'Verification took too long. Please check your internet connection and try again.',
                    [{ text: 'Try Again', onPress: resetScanner }]
                );
            }
        }, VERIFICATION_TIMEOUT_MS);

        // Fire the API call
        completeOrderAsync({ orderId: bookingId, qrCodeData: data })
            .then((response) => {
                console.log('[QRScanner] API success:', JSON.stringify(response));

                // Clear safety timeout
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
                isProcessingRef.current = false;
                setVerifying(false);

                const orderStatus = response?.data?.order?.status || 'COMPLETED';

                Alert.alert(
                    '✅ Order Completed!',
                    `Order has been successfully verified and marked as ${orderStatus}.`,
                    [
                        { text: 'Scan Another', onPress: resetScanner },
                        { text: 'Done', onPress: () => navigation.goBack(), style: 'cancel' }
                    ]
                );
            })
            .catch((error: any) => {
                console.log('[QRScanner] API error:', error?.message, error?.response?.status, error?.response?.data);

                // Clear safety timeout
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
                isProcessingRef.current = false;
                setVerifying(false);

                // Extract error message from backend format: { success: false, error: { code, message } }
                let msg = 'Something went wrong. Please try again.';
                if (error?.response?.data?.error?.message) {
                    msg = error.response.data.error.message;
                } else if (error?.response?.data?.message) {
                    msg = error.response.data.message;
                } else if (error?.message) {
                    msg = error.message;
                }

                // User-friendly messages
                if (msg.includes('INVALID_QR_CODE') || msg.includes('Invalid QR')) {
                    msg = 'This QR code is invalid or not recognized.';
                } else if (msg.includes('not found') || msg.includes('Not Found')) {
                    msg = 'This order was not found. It may have been already completed or cancelled.';
                } else if (msg.includes('BOOKING_CANNOT_COMPLETE') || msg.includes('Cannot complete')) {
                    msg = 'This order cannot be completed. It may have already been picked up or cancelled.';
                } else if (msg.includes('Unauthorized') || msg.includes('not a seller')) {
                    msg = 'You are not authorized to complete this order. Please re-login.';
                } else if (msg.includes('timeout') || msg.includes('ECONNABORTED')) {
                    msg = 'Request timed out. Please check your internet connection.';
                } else if (msg.includes('Network Error')) {
                    msg = 'Network error. Please check your internet connection.';
                }

                Alert.alert(
                    'Verification Failed',
                    msg,
                    [{ text: 'Try Again', onPress: resetScanner }]
                );
            });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="black" />

            <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                enableTorch={torchEnabled}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
            />

            {/* Dark Overlay with transparent cutout */}
            <View style={styles.overlayContainer}>
                <View style={styles.overlaySide} />
                <View style={styles.overlayCenter}>
                    <View style={styles.overlaySide} />
                    <View style={styles.focusedContainer}>
                        {/* Corner Targets */}
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />

                        {/* Scanning Line Animation (Static for now, can animate) */}
                        {!scanned && !verifying && <View style={styles.scanLine} />}
                    </View>
                    <View style={styles.overlaySide} />
                </View>
                <View style={styles.overlayBottom}>
                    <Text style={styles.hintText}>Align QR code within the frame</Text>

                    {/* Torch Button */}
                    <TouchableOpacity
                        style={[styles.torchButton, torchEnabled && styles.torchActive]}
                        onPress={() => setTorchEnabled(!torchEnabled)}
                    >
                        <Icon name={torchEnabled ? "sun" : "moon"} size={24} color={torchEnabled ? colors.primary : "white"} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Header Controls */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                    <Icon name="x" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Scan Order</Text>
                <View style={{ width: 44 }} />
            </View>

            {verifying && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Verifying...</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    permissionContainer: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        padding: spacing.xl,
    },
    permissionContent: {
        alignItems: 'center',
    },
    permissionTitle: {
        ...typography.h2,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    permissionMessage: {
        ...typography.body,
        textAlign: 'center',
        color: colors.text.secondary,
        marginBottom: spacing.xl,
    },
    primaryButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: spacing.radiusLg,
        width: '100%',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    primaryButtonText: {
        ...typography.button,
        color: 'white',
    },
    secondaryButton: {
        paddingVertical: spacing.md,
        width: '100%',
        alignItems: 'center',
    },
    secondaryButtonText: {
        ...typography.button,
        color: colors.text.secondary,
    },
    // Overlay structure to create transparent cutout
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
    },
    overlaySide: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    overlayCenter: {
        flexDirection: 'row',
        height: SCAN_FRAME_SIZE,
    },
    overlayBottom: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        paddingTop: spacing.xl,
    },
    focusedContainer: {
        width: SCAN_FRAME_SIZE,
        height: SCAN_FRAME_SIZE,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: colors.primary,
        borderWidth: 4,
    },
    topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 16 },
    topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 16 },
    bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 16 },
    bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 16 },

    scanLine: {
        width: '100%',
        height: 2,
        backgroundColor: colors.primary,
        position: 'absolute',
        top: '50%',
        opacity: 0.6,
    },
    hintText: {
        ...typography.body,
        color: 'white',
        textAlign: 'center',
        marginBottom: spacing.xl,
        opacity: 0.9,
    },
    torchButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    torchActive: {
        backgroundColor: 'white',
    },

    // Header
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10,
    },
    headerTitle: {
        ...typography.h3,
        color: 'white',
    },
    closeButton: {
        width: 44,
        height: 44,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Loading
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
    },
    loadingText: {
        ...typography.h3,
        color: 'white',
        marginTop: spacing.md,
    },
});

export default QRScannerScreen;
