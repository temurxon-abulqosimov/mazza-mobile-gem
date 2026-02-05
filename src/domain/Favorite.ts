import { Store } from "./Store";
import { Product } from "./Product";

export interface FavoriteStore extends Store {
    // Any favorite-specific fields can be added here
}

export interface FavoriteProduct extends Product {
    // Any favorite-specific fields can be added here
}
