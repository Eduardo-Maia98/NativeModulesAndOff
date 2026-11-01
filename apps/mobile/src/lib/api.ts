import { Platform } from 'react-native';
import {
  NoteCreateResponseSchema,
  NotesListResponseSchema,
  PullResponseSchema,
  PushResponseSchema,
  type Note,
  type OutboxItem,
  type PullResponse,
  type PushResponse,
} from '@nmao/shared';

function defaultApiUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'android') {
    return 'http://192.168.15.35:3333';
  }
  return 'http://localhost:3333';
}

export const API_URL = defaultApiUrl();

async function request(path: string, init?: RequestInit) {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API ${response.status}: ${body}`);
  }

  return response.json();
}

export async function fetchRemoteNotes(): Promise<Note[]> {
  const json = await request('/notes');
  return NotesListResponseSchema.parse(json).notes;
}

export async function createRemoteNote(title: string, body = ''): Promise<Note> {
  const json = await request('/notes', {
    method: 'POST',
    body: JSON.stringify({
      title: title.trim() || 'Sem titulo',
      body,
    }),
  });
  return NoteCreateResponseSchema.parse(json).note;
}

export async function pullChanges(since: number): Promise<PullResponse> {
  const json = await request(`/sync/pull?since=${since}`);
  return PullResponseSchema.parse(json);
}

export async function pushChanges(changes: OutboxItem[]): Promise<PushResponse> {
  const json = await request('/sync/push', {
    method: 'POST',
    body: JSON.stringify({ changes }),
  });
  return PushResponseSchema.parse(json);
}
