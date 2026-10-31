import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { StatusBar } from 'expo-status-bar';
import type { Note } from '@nmao/shared';
import { migrateLocalDb } from './src/db/client';
import { createNote, deleteNote, listOutbox, listVisibleNotes } from './src/db/repository';
import { API_URL } from './src/lib/api';
import { readNativeBridge, type NativeStatus } from './src/native/device';
import { syncNow, type SyncResult } from './src/sync/engine';

export default function App() {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [outboxCount, setOutboxCount] = useState(0);
  const [online, setOnline] = useState<boolean | null>(null);
  const [native, setNative] = useState<NativeStatus>(() => readNativeBridge());
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(() => {
    setNotes(listVisibleNotes());
    setOutboxCount(listOutbox().length);
  }, []);

  useEffect(() => {
    migrateLocalDb();
    refresh();
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setOnline(Boolean(state.isConnected));
    });
    return () => unsubscribe();
  }, [refresh]);

  async function handleCreate() {
    createNote(title);
    setTitle('');
    refresh();
  }

  async function handleDelete(id: string) {
    deleteNote(id);
    refresh();
  }

  async function handleSync() {
    setBusy(true);
    const result = await syncNow();
    setSyncResult(result);
    refresh();
    setBusy(false);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.kicker}>Spec-Driven study lab</Text>
          <Text style={styles.title}>NativeModulesAndOff</Text>
          <Text style={styles.subtitle}>
            SQLite local-first + Turbo Module nativo
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Turbo Module</Text>
          {native.ok ? (
            <>
              <Text style={styles.mono}>
                {native.snapshot.platform} · {native.snapshot.model}
              </Text>
              <Text style={styles.muted}>
                emulator={String(native.snapshot.isEmulator)} · {native.echo}
              </Text>
            </>
          ) : (
            <Text style={styles.warn}>{native.message}</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Offline-first</Text>
          <Text style={styles.muted}>
            rede: {online == null ? '...' : online ? 'online' : 'offline'} · outbox:{' '}
            {outboxCount} · api: {API_URL}
          </Text>
          {syncResult ? (
            <Text style={styles.mono}>{formatSync(syncResult)}</Text>
          ) : null}
          <Pressable
            style={[styles.button, busy && styles.buttonDisabled]}
            onPress={handleSync}
            disabled={busy}
          >
            <Text style={styles.buttonText}>{busy ? 'Sincronizando...' : 'Sincronizar'}</Text>
          </Pressable>
        </View>

        <View style={styles.composer}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Nova nota (grava no SQLite agora)"
            placeholderTextColor="#7A8899"
            style={styles.input}
            onSubmitEditing={handleCreate}
            returnKeyType="done"
          />
          <Pressable style={styles.button} onPress={handleCreate}>
            <Text style={styles.buttonText}>Salvar</Text>
          </Pressable>
        </View>

        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.muted}>Nenhuma nota local ainda.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.note}>
              <View style={styles.flex}>
                <Text style={styles.noteTitle}>{item.title}</Text>
                <Text style={styles.muted}>
                  {new Date(item.updatedAt).toLocaleString()}
                </Text>
              </View>
              <Pressable onPress={() => handleDelete(item.id)}>
                <Text style={styles.delete}>excluir</Text>
              </Pressable>
            </View>
          )}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function formatSync(result: SyncResult) {
  if (result.status === 'ok') {
    return `pull ${result.pulled} · push ${result.pushed}`;
  }
  if (result.status === 'skipped') {
    return `sync pulado: ${result.reason}`;
  }
  return `erro: ${result.message}`;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0B1220',
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  kicker: {
    color: '#5EEAD4',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
  },
  subtitle: {
    color: '#94A3B8',
    marginTop: 4,
  },
  card: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#121A2A',
    gap: 6,
  },
  cardTitle: {
    color: '#E2E8F0',
    fontWeight: '700',
  },
  mono: {
    color: '#A5F3FC',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 13,
  },
  muted: {
    color: '#94A3B8',
    fontSize: 13,
  },
  warn: {
    color: '#FCD34D',
    fontSize: 13,
    lineHeight: 18,
  },
  composer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 16,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#121A2A',
    color: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  button: {
    backgroundColor: '#5EEAD4',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#042F2E',
    fontWeight: '700',
  },
  list: {
    padding: 20,
    gap: 10,
  },
  note: {
    backgroundColor: '#121A2A',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  noteTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },
  delete: {
    color: '#FCA5A5',
    fontWeight: '600',
  },
});
