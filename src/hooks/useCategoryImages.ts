import { useState, useEffect } from 'react';
import { getCategoryImages } from '../api/categories';

export const useCategoryImages = () => {
    const [images, setImages] = useState<Record<string, string[]>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const data = await getCategoryImages();
                setImages(data);
            } catch (err: any) {
                console.error('Failed to fetch category images:', err);
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchImages();
    }, []);

    return { images, isLoading, error };
};
