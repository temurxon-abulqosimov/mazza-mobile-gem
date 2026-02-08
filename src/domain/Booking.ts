import { BookingStatus } from './enums/BookingStatus';
import { PickupWindow, Product } from './Product';
import { Store } from './Store';

export { BookingStatus };

export interface BookingPayment {
  status: string;
  amount: number;
  currency: string;
  last4: string;
}

export interface Booking {
  id: string;
  orderNumber: string;
  status: BookingStatus;
  statusLabel: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  pickupWindow: PickupWindow;
  qrCode: string;
  qrCodeData: string;
  product: Pick<Product, 'id' | 'name'> & { imageUrl: string };
  store: Pick<Store, 'id' | 'name' | 'location'>;
  payment: BookingPayment;
  createdAt: string;
  confirmedAt: string;
  completedAt: string | null;
  isReviewed?: boolean;
}
