import { useEffect, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { Note } from '@nmao/shared';
import { createNote, deleteNote, listVisibleNotes } from '../db/repository';
import { API_URL, createRemoteNote } from '../lib/api';
import { readNativeBridge, type NativeStatus } from '../native/device';
import { requestSync } from '../sync/auto';
import { formatSync } from '../sync/format';
import { useSyncStatus } from '../sync/SyncProvider';
import { Screen } from '../ui/Screen';
import { colors } from '../ui/theme';

export function AddScreen() {
  const { online, outboxCount, syncResult, revision, notifyLocalChange } = useSyncStatus();
  const [title, setTitle] = useState('');
  const [remoteTitle, setRemoteTitle] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [native] = useState<NativeStatus>(() => readNativeBridge());
  const [remoteError, setRemoteError] = useState<string | null>(null);
  const [savingRemote, setSavingRemote] = useState(false);

  useEffect(() => {
    setNotes(listVisibleNotes());
  }, [revision]);

  function handleCreate() {
    createNote(title);
    setTitle('');
    notifyLocalChange();
  }

  async function handleCreateRemote() {
    if (savingRemote) return;
    setSavingRemote(true);
    try {
      await createRemoteNote(remoteTitle);
      setRemoteTitle('');
      setRemoteError(null);
      void requestSync();
    } catch (caught) {
      setRemoteError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setSavingRemote(false);
    }
  }

  function handleDelete(id: string) {
    deleteNote(id);
    notifyLocalChange();
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.kicker}>Spec-Driven study lab</Text>
          <Text style={styles.title}>NativeModulesAndOff</Text>
          <Text style={styles.subtitle}>SQLite local-first + Turbo Module nativo</Text>
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
          {syncResult ? <Text style={styles.mono}>{formatSync(syncResult)}</Text> : (
            <Text style={styles.muted}>sync automático a cada 5s</Text>
          )}
        </View>

        <View style={styles.composer}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Nova nota (grava no SQLite agora)"
            placeholderTextColor={colors.muted}
            style={styles.input}
            onSubmitEditing={handleCreate}
            returnKeyType="done"
          />
          <Pressable style={styles.button} onPress={handleCreate}>
            <Text style={styles.buttonText}>Salvar</Text>
          </Pressable>
        </View>

        <View style={styles.composer}>
          <TextInput
            value={remoteTitle}
            onChangeText={setRemoteTitle}
            placeholder="Nova nota (grava no backend agora)"
            placeholderTextColor={colors.muted}
            style={styles.input}
            onSubmitEditing={() => {
              void handleCreateRemote();
            }}
            returnKeyType="done"
            editable={!savingRemote}
          />
          <Pressable
            style={[styles.button, savingRemote && styles.buttonDisabled]}
            onPress={() => {
              void handleCreateRemote();
            }}
            disabled={savingRemote}
          >
            <Text style={styles.buttonText}>{savingRemote ? '...' : 'Salvar'}</Text>
          </Pressable>
        </View>
        {remoteError ? (
          <Text style={[styles.warn, styles.remoteError]}>{remoteError}</Text>
        ) : null}

        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.muted}>Nenhuma nota local ainda.</Text>}
          renderItem={({ item }) => (
            <View style={styles.note}>
              <View style={styles.flex}>
                <Text style={styles.noteTitle}>{item.title}</Text>
                <Text style={styles.muted}>{new Date(item.updatedAt).toLocaleString()}</Text>
              </View>
              <Pressable onPress={() => handleDelete(item.id)}>
                <Text style={styles.delete}>excluir</Text>
              </Pressable>
            </View>
          )}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  kicker: {
    color: colors.kicker,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
  },
  subtitle: {
    color: colors.muted,
    marginTop: 4,
  },
  card: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.card,
    gap: 6,
  },
  cardTitle: {
    color: '#E2E8F0',
    fontWeight: '700',
  },
  mono: {
    color: colors.mono,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 13,
  },
  muted: {
    color: colors.muted,
    fontSize: 13,
  },
  warn: {
    color: colors.warn,
    fontSize: 13,
    lineHeight: 18,
  },
  remoteError: {
    paddingHorizontal: 20,
    paddingTop: 8,
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
    backgroundColor: colors.card,
    color: colors.text,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.accentText,
    fontWeight: '700',
  },
  list: {
    padding: 20,
    gap: 10,
  },
  note: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  noteTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  delete: {
    color: colors.danger,
    fontWeight: '600',
  },
});
