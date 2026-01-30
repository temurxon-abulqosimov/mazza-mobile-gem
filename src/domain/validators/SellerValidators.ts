import { z } from 'zod';

export const sellerApplicationSchema = z.object({
  businessName: z.string().min(3, 'Business name is required').max(100),
  description: z.string().min(20, 'Please provide a brief description (at least 20 characters)').max(500),
  address: z.string().min(5, 'Address is required').max(200),
  city: z.string().min(2, 'City is required').max(100),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  phone: z.string().min(10).max(20).optional(),
});

export type SellerApplicationFormData = z.infer<typeof sellerApplicationSchema>;
