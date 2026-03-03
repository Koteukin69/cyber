import { z } from 'zod';

export const schemas = {
  requestCode: z.object({
    email: z.email("Введите правильный email"),
  }),
  verifyCode: z.object({
    email: z.email(),
    code: z.string().regex(/^\d{6}$/, "Введите 6 цифр"),
  }),
}
