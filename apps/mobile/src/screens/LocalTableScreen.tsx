import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { Note } from '@nmao/shared';
import { listAllNotes } from '../db/repository';
import { useSyncStatus } from '../sync/SyncProvider';
import { NoteTable } from '../ui/NoteTable';
import { Screen } from '../ui/Screen';
import { colors } from '../ui/theme';

export function LocalTableScreen() {
  const { revision, outboxCount } = useSyncStatus();
  const [notes, setNotes] = useState<Note[]>([]);

  const load = useCallback(() => {
    setNotes(listAllNotes());
  }, []);

  useEffect(() => {
    load();
  }, [load, revision]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <Screen>
      <View
        style={styles.header}
        accessible
        accessibilityRole="header"
        accessibilityLabel={`Tabela local. SQLite no aparelho. ${notes.length} ${notes.length === 1 ? 'linha' : 'linhas'}. Outbox ${outboxCount}`}
      >
        <Text style={styles.kicker} importantForAccessibility="no">
          SQLite no device
        </Text>
        <Text style={styles.title} importantForAccessibility="no">
          Tabela local
        </Text>
        <Text style={styles.muted} importantForAccessibility="no">
          notes · {notes.length} row{notes.length === 1 ? '' : 's'} · outbox {outboxCount}
        </Text>
      </View>
      <NoteTable notes={notes} emptyText="Tabela notes vazia no SQLite." />
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
});
