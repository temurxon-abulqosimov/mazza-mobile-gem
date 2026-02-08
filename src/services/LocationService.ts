import * as Location from 'expo-location';
import { Alert, Linking } from 'react-native';

export type LocationResult = {
    success: boolean;
    location?: Location.LocationObject;
    error?: string;
    permissionStatus?: Location.PermissionStatus;
};

class LocationService {
    private static instance: LocationService;

    // Default timeout: 5 seconds
    private readonly TIMEOUT_MS = 5000;

    private constructor() { }

    public static getInstance(): LocationService {
        if (!LocationService.instance) {
            LocationService.instance = new LocationService();
        }
        return LocationService.instance;
    }

    /**
     * Request foreground permissions
     */
    public async requestPermissions(): Promise<Location.PermissionStatus> {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            return status;
        } catch (error) {
            console.error('Error requesting location permissions:', error);
            return Location.PermissionStatus.UNDETERMINED;
        }
    }

    /**
     * Check current permission status without prompting
     */
    public async checkPermissions(): Promise<Location.PermissionStatus> {
        try {
            const { status } = await Location.getForegroundPermissionsAsync();
            return status;
        } catch (error) {
            console.error('Error checking location permissions:', error);
            return Location.PermissionStatus.UNDETERMINED;
        }
    }

    /**
     * Get current location with timeout and fallback
     */
    public async getCurrentLocation(): Promise<LocationResult> {
        try {
            // 1. Check Permissions
            const status = await this.checkPermissions();

            if (status !== Location.PermissionStatus.GRANTED) {
                return {
                    success: false,
                    error: 'Permission not granted',
                    permissionStatus: status
                };
            }

            // 2. Try to get current position with timeout
            // Use Balanced accuracy for speed and reliability indoors
            const locationPromise = Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            // Create a timeout promise
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error('Location request timed out')), this.TIMEOUT_MS);
            });

            try {
                const location = await Promise.race([locationPromise, timeoutPromise]);
                return { success: true, location };
            } catch (timeoutError) {
                console.warn('Location request timed out, trying fallback...');

                // 3. Fallback to last known position
                const lastKnown = await Location.getLastKnownPositionAsync();
                if (lastKnown) {
                    return { success: true, location: lastKnown };
                }

                return {
                    success: false,
                    error: 'Location unavailable (timeout and no last known position)'
                };
            }

        } catch (error: any) {
            console.error('LocationService Error:', error);
            return {
                success: false,
                error: error.message || 'Unknown location error'
            };
        }
    }

    /**
     * Open system settings for location
     */
    public openSettings() {
        Linking.openSettings();
    }
}

export const locationService = LocationService.getInstance();
