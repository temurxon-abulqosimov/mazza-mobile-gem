// Local category images used as fallbacks
export const CATEGORY_IMAGES = {
    bakery: require('../../assets/categories/bakery.jpg'),
    desserts: require('../../assets/categories/desserts.jpg'),
    'fast-food': require('../../assets/categories/fast-food.jpg'),
    traditional: require('../../assets/categories/traditional.jpg'),
    salad: require('../../assets/categories/salad.jpg'),
};

export const getCategoryImage = (slug?: string) => {
    if (!slug) return CATEGORY_IMAGES.bakery; // Default

    // Normalize slug to match keys
    const key = slug.toLowerCase() as keyof typeof CATEGORY_IMAGES;
    return CATEGORY_IMAGES[key] || CATEGORY_IMAGES.bakery;
};
