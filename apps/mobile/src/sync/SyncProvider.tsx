import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { migrateLocalDb } from '../db/client';
import { listOutbox } from '../db/repository';
import { requestSync, startAutoSync, subscribeSync, type SyncResult } from './auto';

type SyncContextValue = {
  online: boolean | null;
  outboxCount: number;
  syncResult: SyncResult | null;
  revision: number;
  notifyLocalChange: () => void;
};

const SyncContext = createContext<SyncContextValue | null>(null);

export function SyncProvider({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState<boolean | null>(null);
  const [outboxCount, setOutboxCount] = useState(0);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [revision, setRevision] = useState(0);

  const bump = useCallback(() => {
    setOutboxCount(listOutbox().length);
    setRevision((current) => current + 1);
  }, []);

  useEffect(() => {
    migrateLocalDb();
    bump();

    const unsubSync = subscribeSync((result) => {
      setSyncResult(result);
      bump();
    });
    const unsubNet = NetInfo.addEventListener((state: NetInfoState) => {
      setOnline(Boolean(state.isConnected));
    });
    const stopAuto = startAutoSync();

    return () => {
      unsubNet();
      stopAuto();
      unsubSync();
    };
  }, [bump]);

  const notifyLocalChange = useCallback(() => {
    bump();
    void requestSync();
  }, [bump]);

  const value = useMemo(
    () => ({
      online,
      outboxCount,
      syncResult,
      revision,
      notifyLocalChange,
    }),
    [online, outboxCount, syncResult, revision, notifyLocalChange],
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSyncStatus() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSyncStatus precisa de SyncProvider');
  }
  return context;
}
