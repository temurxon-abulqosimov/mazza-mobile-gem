import { Category } from './Category';

export interface StoreLocation {
  address: string;
  city?: string;
  lat: number;
  lng: number;
}

export interface Store {
  id: string;
  name: string;
  rating: number;
  imageUrl: string;
  location: StoreLocation;
  distance?: number; // Optional, as it's context-dependent (e.g., in discovery)
  description?: string;
  reviewCount?: number;
  categories?: Category[];
  totalProductsSold?: number;
  foodSavedKg?: number;
  createdAt?: string;
}
