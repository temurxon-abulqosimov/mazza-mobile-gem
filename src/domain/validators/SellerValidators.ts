import { z } from 'zod';

export const sellerApplicationSchema = z.object({
  businessName: z.string().min(3, 'Business name is required'),
  businessType: z.string().min(3, 'Business type is required'),
  description: z.string().min(20, 'Please provide a brief description (at least 20 characters)'),
  phoneNumber: z.string().min(10, 'A valid phone number is required'),
});

export type SellerApplicationFormData = z.infer<typeof sellerApplicationSchema>;
