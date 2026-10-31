import { z } from 'zod';

export const NoteSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  body: z.string(),
  updatedAt: z.number().int().nonnegative(),
  deletedAt: z.number().int().nonnegative().nullable(),
});

export type Note = z.infer<typeof NoteSchema>;

export const NoteInputSchema = z.object({
  title: z.string().min(1),
  body: z.string().default(''),
});

export type NoteInput = z.infer<typeof NoteInputSchema>;
