import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { Note } from '@nmao/shared';
import { API_URL, fetchRemoteNotes } from '../lib/api';
import { useSyncStatus } from '../sync/SyncProvider';
import { NoteTable } from '../ui/NoteTable';
import { Screen } from '../ui/Screen';
import { colors } from '../ui/theme';

export function RemoteTableScreen() {
  const { revision, online } = useSyncStatus();
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const rows = await fetchRemoteNotes();
      setNotes(rows);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, revision]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <Screen>
      <View
        style={styles.header}
        accessible
        accessibilityRole="header"
        accessibilityLabel={`Tabela backend. SQLite no servidor. Rede ${online == null ? 'verificando' : online ? 'online' : 'offline'}. API ${API_URL}`}
      >
        <Text style={styles.kicker} importantForAccessibility="no">
          SQLite no servidor
        </Text>
        <Text style={styles.title} importantForAccessibility="no">
          Tabela backend
        </Text>
        <Text style={styles.muted} importantForAccessibility="no">
          GET /notes · {online == null ? '...' : online ? 'online' : 'offline'} · {API_URL}
        </Text>
      </View>
      {error ? (
        <Text
          style={[styles.warn, styles.error]}
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
        >
          {error}
        </Text>
      ) : null}

      <NoteTable
        notes={notes}
        emptyText={error ? 'Sem dados do backend.' : 'Tabela notes vazia no servidor.'}
        refreshing={refreshing}
        onRefresh={() => {
          void handleRefresh();
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 4,
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
  },
  muted: {
    color: colors.muted,
    fontSize: 13,
  },
  warn: {
    color: colors.warn,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  error: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
});
