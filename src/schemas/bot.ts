import { z } from "zod";

export const StartBotSchema = z.object({
  max_risk: z.number().optional(),
  lot_size: z.number().optional(),
});
