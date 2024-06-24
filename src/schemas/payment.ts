import { z } from "zod";

//enum
export const Plan = z.enum([
  "BASIC_NORMAL",
  "CUSTOMIZED_NORMAL",
  "BASIC_PRIME",
  "CUSTOMIZED_PRIME",
]);

export const PaySchema = z.object({
  plan: Plan,
});
