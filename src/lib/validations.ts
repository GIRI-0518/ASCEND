import { z } from "zod";

export const createQuestSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title too long"),
  description: z.string().max(500, "Description too long").optional(),
  attributeCategory: z.enum(["Strength", "Agility", "Intellect", "Sense", "Spirit"]),
  verificationTier: z.number().int().min(1).max(2).default(1),
  difficulty: z.enum(["Easy", "Normal", "Hard", "Extreme"]).default("Normal"),
  isDaily: z.boolean().default(false),
});

export const completeQuestSchema = z.object({
  proofUrl: z.string().url().optional(),
  selfAttest: z.boolean().default(true),
});

export const updateQuestSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().max(500).optional(),
  difficulty: z.enum(["Easy", "Normal", "Hard", "Extreme"]).optional(),
});

export type CreateQuestInput = z.infer<typeof createQuestSchema>;
export type CompleteQuestInput = z.infer<typeof completeQuestSchema>;
export type UpdateQuestInput = z.infer<typeof updateQuestSchema>;
