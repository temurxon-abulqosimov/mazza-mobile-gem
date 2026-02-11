import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Initialize i18n
i18n
    .use(initReactI18next)
    .init({
        compatibilityJSON: 'v4',
        resources,
        lng: 'uz', // Default language
        fallbackLng: 'uz',
        interpolation: {
            escapeValue: false,
        },
        react: {
            useSuspense: false,
        },
    });

// Load persisted language - only switch if user explicitly chose a language before
const loadLanguage = async () => {
    try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (savedLanguage) {
            await i18n.changeLanguage(savedLanguage);
        }
        // If no saved language, keep default 'uz' — don't override with device language
    } catch (error) {
        console.warn('Error loading language', error);
    }
};

loadLanguage();

export default i18n;

// Helper to change language and persist it
export const changeLanguage = async (lang: string) => {
    try {
        await i18n.changeLanguage(lang);
        await AsyncStorage.setItem(LANGUAGE_KEY, lang);
        console.log(`Language changed to ${lang} and persisted.`);
    } catch (error) {
        console.error('Failed to change language', error);
    }
};
