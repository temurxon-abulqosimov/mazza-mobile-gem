import { Booking } from '../domain/Booking';

export type DiscoveryStackParamList = {
    DiscoveryFeed: undefined;
    ProductDetail: { productId: string };
    StoreProfile: {
        storeId: string;
        storeName: string;
        storeImage?: string;
        storeAddress?: string;
        storeRating?: number;
    };
    BookingConfirmation: { booking: Booking };
};

export type MainTabParamList = {
    Discover: undefined;
    Map: undefined;
    Orders: undefined;
    Favorites: undefined;
    Profile: undefined;
    Admin: undefined;
    Seller: undefined;
};
