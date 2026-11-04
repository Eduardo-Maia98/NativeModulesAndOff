import type { Note } from '@nmao/shared';
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from './theme';

const COLUMNS: { key: keyof Note; label: string; width: number }[] = [
  { key: 'id', label: 'id', width: 88 },
  { key: 'title', label: 'title', width: 160 },
  { key: 'body', label: 'body', width: 140 },
  { key: 'updatedAt', label: 'updated_at', width: 168 },
  { key: 'deletedAt', label: 'deleted_at', width: 168 },
];

const TABLE_WIDTH = COLUMNS.reduce((sum, column) => sum + column.width, 0);

type Props = {
  notes: Note[];
  emptyText: string;
  refreshing?: boolean;
  onRefresh?: () => void;
};

export function NoteTable({ notes, emptyText, refreshing = false, onRefresh }: Props) {
  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.vertical}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        ) : undefined
      }
    >
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View style={[styles.table, { width: TABLE_WIDTH }]}>
          <View
            style={[styles.row, styles.headerRow]}
            accessible
            accessibilityRole="header"
            accessibilityLabel={`Colunas: ${COLUMNS.map((column) => column.label).join(', ')}`}
          >
            {COLUMNS.map((column) => (
              <Text
                key={column.key}
                style={[styles.headerCell, { width: column.width }]}
                importantForAccessibility="no"
              >
                {column.label}
              </Text>
            ))}
          </View>
          {notes.length === 0 ? (
            <Text style={styles.empty} accessibilityRole="text">
              {emptyText}
            </Text>
          ) : (
            notes.map((note) => (
              <View
                key={note.id}
                style={[styles.row, note.deletedAt != null && styles.deletedRow]}
                accessible
                accessibilityRole="text"
                accessibilityLabel={noteRowLabel(note)}
              >
                {COLUMNS.map((column) => (
                  <Text
                    key={column.key}
                    style={[styles.cell, { width: column.width }]}
                    numberOfLines={1}
                    importantForAccessibility="no"
                  >
                    {formatCell(note, column.key)}
                  </Text>
                ))}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </ScrollView>
  );
}

function noteRowLabel(note: Note) {
  const title = note.title.trim() || 'sem título';
  const updated = new Date(Number(note.updatedAt)).toLocaleString();
  const deleted =
    note.deletedAt == null
      ? 'não excluída'
      : `excluída em ${new Date(Number(note.deletedAt)).toLocaleString()}`;
  return `Nota ${title}. id ${note.id.slice(0, 8)}. Atualizada em ${updated}. ${deleted}`;
}

function formatCell(note: Note, key: keyof Note) {
  const value = note[key];
  if (key === 'id' && typeof value === 'string') {
    return value.slice(0, 8);
  }
  if (key === 'updatedAt' || key === 'deletedAt') {
    return value == null ? '—' : new Date(Number(value)).toLocaleString();
  }
  if (value === '' || value == null) {
    return '—';
  }
  return String(value);
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  vertical: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  headerRow: {
    backgroundColor: '#0F172A',
  },
  deletedRow: {
    opacity: 0.55,
  },
  headerCell: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    paddingRight: 8,
  },
  cell: {
    color: colors.mono,
    fontSize: 12,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    paddingRight: 8,
  },
  empty: {
    color: colors.muted,
    padding: 16,
    fontSize: 13,
  },
});
