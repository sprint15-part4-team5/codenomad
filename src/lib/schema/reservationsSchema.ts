import { z } from 'zod';

export const reviewRequestSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  content: z.string().max(100),
});

export type ReviewType = z.infer<typeof reviewRequestSchema>;
