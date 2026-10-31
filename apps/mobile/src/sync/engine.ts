import NetInfo from '@react-native-community/netinfo';
import { pullChanges, pushChanges } from '../lib/api';
import {
  getLastPulledAt,
  listOutbox,
  removeOutboxItems,
  setLastPulledAt,
  upsertFromRemote,
} from '../db/repository';

let syncing = false;

export type SyncResult =
  | { status: 'skipped'; reason: 'offline' | 'busy' }
  | { status: 'ok'; pulled: number; pushed: number }
  | { status: 'error'; message: string };

export async function syncNow(): Promise<SyncResult> {
  if (syncing) {
    return { status: 'skipped', reason: 'busy' };
  }

  const net = await NetInfo.fetch();
  if (!net.isConnected) {
    return { status: 'skipped', reason: 'offline' };
  }

  syncing = true;
  try {
    const since = getLastPulledAt();
    const pulled = await pullChanges(since);
    for (const note of pulled.notes) {
      upsertFromRemote(note);
    }
    setLastPulledAt(pulled.serverTime);

    const pending = listOutbox();
    if (pending.length > 0) {
      const pushed = await pushChanges(pending);
      removeOutboxItems(pushed.acceptedIds);
    }

    return {
      status: 'ok',
      pulled: pulled.notes.length,
      pushed: pending.length,
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : String(error),
    };
  } finally {
    syncing = false;
  }
}
