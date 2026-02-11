import { z } from 'zod';

const phoneRegex = /^998\d{9}$/;

export const loginSchema = z.object({
  phoneNumber: z
    .string()
    .regex(phoneRegex, 'Telefon raqam 998XXXXXXXXX formatida bo\'lishi kerak'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phoneNumber: z
    .string()
    .regex(phoneRegex, 'Telefon raqam 998XXXXXXXXX formatida bo\'lishi kerak'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  marketId: z.string().uuid('A market must be selected'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
