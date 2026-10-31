import { z } from 'zod';
import { NoteSchema } from './note';

export const SyncOperationSchema = z.enum(['upsert', 'delete']);
export type SyncOperation = z.infer<typeof SyncOperationSchema>;

export const OutboxItemSchema = z.object({
  id: z.string().uuid(),
  noteId: z.string().uuid(),
  operation: SyncOperationSchema,
  payload: NoteSchema,
  createdAt: z.number().int().nonnegative(),
});

export type OutboxItem = z.infer<typeof OutboxItemSchema>;

export const PullQuerySchema = z.object({
  since: z.coerce.number().int().nonnegative().default(0),
});

export type PullQuery = z.infer<typeof PullQuerySchema>;

export const PullResponseSchema = z.object({
  notes: z.array(NoteSchema),
  serverTime: z.number().int().nonnegative(),
});

export type PullResponse = z.infer<typeof PullResponseSchema>;

export const PushRequestSchema = z.object({
  changes: z.array(OutboxItemSchema).min(1),
});

export type PushRequest = z.infer<typeof PushRequestSchema>;

export const PushResponseSchema = z.object({
  acceptedIds: z.array(z.string().uuid()),
  serverTime: z.number().int().nonnegative(),
});

export type PushResponse = z.infer<typeof PushResponseSchema>;
