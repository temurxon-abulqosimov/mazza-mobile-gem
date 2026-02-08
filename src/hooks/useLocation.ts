import { useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { locationService } from '../services/LocationService';

export const useLocation = () => {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);

    const fetchLocation = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await locationService.getCurrentLocation();

            if (result.permissionStatus) {
                setPermissionStatus(result.permissionStatus);
            }

            if (result.success && result.location) {
                setLocation(result.location);
                return result.location;
            } else {
                setError(result.error || 'Failed to get location');
                return null;
            }
        } catch (err: any) {
            setError(err.message || 'Unexpected error getting location');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const requestPermissions = useCallback(async () => {
        const status = await locationService.requestPermissions();
        setPermissionStatus(status);
        return status === Location.PermissionStatus.GRANTED;
    }, []);

    return {
        location,
        error,
        isLoading,
        permissionStatus,
        getLocation: fetchLocation,
        requestPermissions,
        openSettings: locationService.openSettings,
    };
};
