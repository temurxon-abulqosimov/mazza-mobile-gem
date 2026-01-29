import { ProductStatus } from './enums/ProductStatus';
import { Store } from './Store';
import { Category } from './Category';

export interface ProductImage {
  url: string;
  thumbnailUrl: string;
  position: number;
}

export interface PickupWindow {
  start: string;
  end: string;
  label: string;
  dateLabel: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  quantity: number;
  quantityAvailable: number;
  pickupWindow: PickupWindow;
  status: ProductStatus;
  images: ProductImage[];
  store: Store;
  category: Category;
  createdAt?: string;
}
