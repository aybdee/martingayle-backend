import { z } from "zod";

export const StartBotSchema = z.object({
  max_loss: z.number().optional(),
  lot_size: z.number().optional(),
});
