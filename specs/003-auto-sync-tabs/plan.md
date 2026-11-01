# Plano 003 — Sync automático e abas

## Navegação

React Navigation (bottom tabs), sem Expo Router: o app já entra por `index.ts` + `App.tsx`.

Dependências via `expo install`:

- `react-native-safe-area-context`
- `react-native-screens`
- `react-native-gesture-handler`
- `@react-navigation/native`
- `@react-navigation/bottom-tabs`

`App.tsx` vira `SafeAreaProvider` + `NavigationContainer` + tabs. Cada tela usa `SafeAreaView` com `edges={['top']}`; a tab bar cobre a base.

## Sync

`src/sync/engine.ts` permanece o loop pull/merge/push.

`src/sync/auto.ts` agenda:

- `NetInfo` → sync ao ficar online
- `setInterval(5000)`
- `requestSync()` depois de criar/excluir
- fila trailing se `syncNow` estiver ocupado

`SyncProvider` migra o SQLite, expõe `revision` / último resultado / online / outbox para as telas re-renderizarem.

## Dados

- Local: `listAllNotes()` lê a tabela `notes` sem filtrar `deletedAt`.
- Backend: `GET /notes` devolve **todas** as rows (incluindo tombstones). `POST /notes` cria uma row no servidor (`NoteInputSchema` → id/timestamps gerados no BE). Cliente parseia lista e create com schemas em `packages/shared`.

## Telas

- `AddScreen` — composer + cards de status/nativo + lista visível.
- `LocalTableScreen` — tabela crua do SQLite, refresh na `revision` e no foco da aba.
- `RemoteTableScreen` — `GET /notes`, composer `POST /notes`, refresh no foco, na `revision` e pull-to-refresh. Depois do create, `requestSync()` puxa a nota para o SQLite local.
