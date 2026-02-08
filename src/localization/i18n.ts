import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { AppState, AppStateStatus } from 'react-native';

// Import translation files
import en from './locales/en.json';
import ru from './locales/ru.json';
import uz from './locales/uz.json';

// Language persistence key
const LANGUAGE_KEY = 'user-language';

const resources = {
    en: { translation: en },
    ru: { translation: ru },
    uz: { translation: uz },
};

// Function to get the best available language
const getLanguage = async () => {
    try {
        // 1. Check saved preference
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (savedLanguage) {
            return savedLanguage;
        }

        // 2. Check device locale
        const deviceLanguage = Localization.getLocales()[0]?.languageCode;
        const supportedLanguages = ['en', 'ru', 'uz'];

        if (deviceLanguage && supportedLanguages.includes(deviceLanguage)) {
            return deviceLanguage;
        }

        // 3. Fallback
        return 'en';
    } catch (error) {
        console.warn('Error reading language preference', error);
        return 'en';
    }
};

// Initialize i18next
const initI18n = async () => {
    const language = await getLanguage();

    i18n
        .use(initReactI18next)
        .init({
            compatibilityJSON: 'v3', // For Android
            resources,
            lng: language,
            fallbackLng: 'en',
            interpolation: {
                escapeValue: false, // React already safe from XSS
            },
            react: {
                useSuspense: false, // React Native doesn't support Suspense fully yet
            },
        });
};

initI18n();

export default i18n;

// Helper to change language and persist it
export const changeLanguage = async (lang: string) => {
    try {
        await i18n.changeLanguage(lang);
        await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    } catch (error) {
        console.error('Failed to change language', error);
    }
};
