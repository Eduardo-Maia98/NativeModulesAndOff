# Tarefas 003 — Sync automático e abas

- [x] Spec + plano deste recorte.
- [x] `NotesListResponseSchema` em `packages/shared`.
- [x] `GET /notes` devolve a tabela completa (com tombstones).
- [x] `listAllNotes()` no repository local.
- [x] `fetchRemoteNotes()` no client da API.
- [x] Scheduler `src/sync/auto.ts` + `SyncProvider`.
- [x] Remover botão Sincronizar; mutações chamam `requestSync()`.
- [x] Instalar safe-area + React Navigation bottom tabs.
- [x] Telas Adicionar / Local / Backend.
- [x] Trocar `SafeAreaView` do React Native pelo de `react-native-safe-area-context`.
- [x] Typecheck.
- [x] `POST /notes` no backend (id gerado no servidor).
- [x] Composer na aba Backend + `createRemoteNote()`.
