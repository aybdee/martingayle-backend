import { z } from "zod";

export const SportyProfile = z.object({
  phone: z.string().min(11).max(20),
  password: z.string(),
});
