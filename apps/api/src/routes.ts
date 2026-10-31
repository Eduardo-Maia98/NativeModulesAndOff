import type { FastifyInstance } from 'fastify';
import { and, eq, gt, isNull } from 'drizzle-orm';
import {
  PullQuerySchema,
  PushRequestSchema,
  type Note,
} from '@nmao/shared';
import { db } from './db';
import { notes } from './schema';

function now() {
  return Date.now();
}

function toNote(row: typeof notes.$inferSelect): Note {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt ?? null,
  };
}

export async function registerRoutes(app: FastifyInstance) {
  app.get('/', async () => ({
    service: 'native-modules-and-off-api',
    routes: ['/health', '/notes', '/sync/pull', '/sync/push'],
  }));

  app.get('/health', async () => ({
    ok: true,
    service: 'native-modules-and-off-api',
    time: now(),
  }));

  app.get('/notes', async () => {
    const rows = db
      .select()
      .from(notes)
      .where(isNull(notes.deletedAt))
      .all();

    return { notes: rows.map(toNote) };
  });

  app.get('/sync/pull', async (request) => {
    const query = PullQuerySchema.parse(request.query);
    const rows = db
      .select()
      .from(notes)
      .where(gt(notes.updatedAt, query.since))
      .all();

    return {
      notes: rows.map(toNote),
      serverTime: now(),
    };
  });

  app.post('/sync/push', async (request, reply) => {
    const parsed = PushRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }

    const acceptedIds: string[] = [];

    for (const change of parsed.data.changes) {
      const incoming = change.payload;
      const existing = db
        .select()
        .from(notes)
        .where(eq(notes.id, incoming.id))
        .get();

      const incomingDeleted =
        change.operation === 'delete' || incoming.deletedAt != null;

      if (!existing) {
        db.insert(notes)
          .values({
            id: incoming.id,
            title: incoming.title,
            body: incoming.body,
            updatedAt: incoming.updatedAt,
            deletedAt: incomingDeleted ? incoming.deletedAt ?? incoming.updatedAt : null,
          })
          .run();
        acceptedIds.push(change.id);
        continue;
      }

      const remoteTombstoneWins = incomingDeleted && existing.deletedAt == null;
      const isNewer = incoming.updatedAt >= existing.updatedAt;

      if (remoteTombstoneWins || isNewer) {
        db.update(notes)
          .set({
            title: incoming.title,
            body: incoming.body,
            updatedAt: incoming.updatedAt,
            deletedAt: incomingDeleted ? incoming.deletedAt ?? incoming.updatedAt : existing.deletedAt,
          })
          .where(and(eq(notes.id, incoming.id)))
          .run();
      }

      acceptedIds.push(change.id);
    }

    return {
      acceptedIds,
      serverTime: now(),
    };
  });
}
