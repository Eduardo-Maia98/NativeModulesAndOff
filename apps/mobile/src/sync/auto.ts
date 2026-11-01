import NetInfo from '@react-native-community/netinfo';
import { AppState, type AppStateStatus } from 'react-native';
import { syncNow, type SyncResult } from './engine';

export type { SyncResult };

const INTERVAL_MS = 5000;

type Listener = (result: SyncResult) => void;

const listeners = new Set<Listener>();

let inFlight = false;
let queued = false;
let intervalId: ReturnType<typeof setInterval> | null = null;

export function subscribeSync(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit(result: SyncResult) {
  for (const listener of listeners) {
    listener(result);
  }
}

export async function requestSync() {
  if (inFlight) {
    queued = true;
    return;
  }

  inFlight = true;
  try {
    do {
      queued = false;
      const result = await syncNow();
      if (result.status === 'ok' || result.status === 'error') {
        emit(result);
      }
    } while (queued);
  } finally {
    inFlight = false;
  }
}

export function startAutoSync(intervalMs = INTERVAL_MS) {
  const unsubNet = NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      void requestSync();
    }
  });

  const onAppState = (status: AppStateStatus) => {
    if (status === 'active') {
      void requestSync();
    }
  };
  const appSub = AppState.addEventListener('change', onAppState);

  intervalId = setInterval(() => {
    void requestSync();
  }, intervalMs);

  return () => {
    unsubNet();
    appSub.remove();
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
}
