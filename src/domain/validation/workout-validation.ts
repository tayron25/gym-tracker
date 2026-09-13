import { z } from "zod";

export const setInputSchema = z.object({
  id: z.string().min(1).optional(),
  setNumber: z.number().int().min(1).max(100),
  setType: z.enum(["warmup", "approach", "working"]),
  weightKg: z.number()
    .min(0, "El peso no puede ser negativo.")
    .max(2000, "El peso supera el máximo permitido.")
    .refine((value) => Math.abs(value * 1000 - Math.round(value * 1000)) < 0.000001, "Usa como máximo tres decimales."),
  reps: z.number().int().min(1, "Usa al menos una repetición.").max(1000, "Las repeticiones superan el máximo permitido."),
  rir: z.number().int().min(0).max(10).nullable(),
});

export type ValidatedSetInput = z.infer<typeof setInputSchema>;
