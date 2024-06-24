import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const SignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).min(3),
  username: z.string().max(6),
  firstname: z.string().min(3),
  lastname: z.string().min(3),
  referral: z.string(),
});
