import { asc, desc, eq, isNull } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';
import type { Note, OutboxItem, SyncOperation } from '@nmao/shared';
import { db } from './client';
import { notes, outbox, syncState } from './schema';

const LAST_PULLED_AT = 'lastPulledAt';

function toNote(row: typeof notes.$inferSelect): Note {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt ?? null,
  };
}

export function listVisibleNotes(): Note[] {
  return db
    .select()
    .from(notes)
    .where(isNull(notes.deletedAt))
    .orderBy(desc(notes.updatedAt))
    .all()
    .map(toNote);
}

export function listAllNotes(): Note[] {
  return db
    .select()
    .from(notes)
    .orderBy(desc(notes.updatedAt))
    .all()
    .map(toNote);
}

export function listOutbox(): OutboxItem[] {
  return db
    .select()
    .from(outbox)
    .orderBy(asc(outbox.createdAt))
    .all()
    .map((row) => ({
      id: row.id,
      noteId: row.noteId,
      operation: row.operation as SyncOperation,
      payload: JSON.parse(row.payload) as Note,
      createdAt: row.createdAt,
    }));
}

export function getLastPulledAt(): number {
  const row = db
    .select()
    .from(syncState)
    .where(eq(syncState.key, LAST_PULLED_AT))
    .get();
  return row ? Number(row.value) : 0;
}

export function setLastPulledAt(value: number) {
  db.insert(syncState)
    .values({ key: LAST_PULLED_AT, value: String(value) })
    .onConflictDoUpdate({
      target: syncState.key,
      set: { value: String(value) },
    })
    .run();
}

function enqueue(note: Note, operation: SyncOperation) {
  db.insert(outbox)
    .values({
      id: Crypto.randomUUID(),
      noteId: note.id,
      operation,
      payload: JSON.stringify(note),
      createdAt: Date.now(),
      attempts: 0,
    })
    .run();
}

export function createNote(title: string, body = ''): Note {
  const note: Note = {
    id: Crypto.randomUUID(),
    title: title.trim() || 'Sem titulo',
    body,
    updatedAt: Date.now(),
    deletedAt: null,
  };

  db.insert(notes)
    .values({
      id: note.id,
      title: note.title,
      body: note.body,
      updatedAt: note.updatedAt,
      deletedAt: null,
    })
    .run();
  enqueue(note, 'upsert');
  return note;
}

export function deleteNote(id: string) {
  const existing = db.select().from(notes).where(eq(notes.id, id)).get();
  if (!existing) return;

  const note: Note = {
    ...toNote(existing),
    updatedAt: Date.now(),
    deletedAt: Date.now(),
  };

  db.update(notes)
    .set({
      updatedAt: note.updatedAt,
      deletedAt: note.deletedAt,
    })
    .where(eq(notes.id, id))
    .run();
  enqueue(note, 'delete');
}

export function upsertFromRemote(note: Note) {
  const existing = db.select().from(notes).where(eq(notes.id, note.id)).get();

  if (!existing) {
    db.insert(notes)
      .values({
        id: note.id,
        title: note.title,
        body: note.body,
        updatedAt: note.updatedAt,
        deletedAt: note.deletedAt,
      })
      .run();
    return;
  }

  const remoteIsDeleted = note.deletedAt != null;
  const shouldApply =
    (remoteIsDeleted && existing.deletedAt == null) ||
    note.updatedAt >= existing.updatedAt;

  if (!shouldApply) return;

  db.update(notes)
    .set({
      title: note.title,
      body: note.body,
      updatedAt: note.updatedAt,
      deletedAt: note.deletedAt,
    })
    .where(eq(notes.id, note.id))
    .run();
}

export function removeOutboxItems(ids: string[]) {
  for (const id of ids) {
    db.delete(outbox).where(eq(outbox.id, id)).run();
  }
}
