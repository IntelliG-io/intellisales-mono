import { z } from 'zod';

const passwordComplexity = (val: string) => {
  const hasUpper = /[A-Z]/.test(val);
  const hasLower = /[a-z]/.test(val);
  const hasNumber = /\d/.test(val);
  const hasSpecial = /[^A-Za-z0-9]/.test(val);
  return hasUpper && hasLower && hasNumber && hasSpecial;
};

export const userRegistrationSchema = z
  .object({
    email: z
      .string()
      .email('Invalid email format')
      .transform((v) => v.trim().toLowerCase()),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be at most 128 characters')
      .refine(passwordComplexity, {
        message: 'Password must contain uppercase, lowercase, number and special character',
      }),
    firstName: z.string().trim().min(2).max(50),
    lastName: z.string().trim().min(2).max(50),
  })
  .strict();

export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>;

export function validateUserRegistration(input: unknown): UserRegistrationInput {
  const parsed = userRegistrationSchema.safeParse(input);
  if (!parsed.success) {
    const details = parsed.error.flatten();
    const message = 'Invalid input data';
    const err: any = new Error(message);
    err.code = 'VALIDATION_ERROR';
    err.status = 400;
    err.details = details;
    throw err;
  }
  return parsed.data;
}

export const userLoginSchema = z
  .object({
    email: z
      .string()
      .email('Invalid email format')
      .transform((v) => v.trim().toLowerCase()),
    password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password must be at most 128 characters'),
  })
  .strict();

export type UserLoginInput = z.infer<typeof userLoginSchema>;

export function validateUserLogin(input: unknown): UserLoginInput {
  const parsed = userLoginSchema.safeParse(input);
  if (!parsed.success) {
    const details = parsed.error.flatten();
    const err: any = new Error('Invalid input data');
    err.code = 'VALIDATION_ERROR';
    err.status = 400;
    err.details = details;
    throw err;
  }
  return parsed.data;
}
