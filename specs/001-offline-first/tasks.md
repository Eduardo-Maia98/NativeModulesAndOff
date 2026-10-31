# Tarefas 001 — Offline-first

- [x] Scaffold do app Expo e do backend.
- [x] Instalar `expo-sqlite`, Drizzle, NetInfo e crypto.
- [x] Criar contrato compartilhado de Note/Sync em `packages/shared`.
- [x] Schema SQLite local (notes, outbox, sync_state).
- [x] Schema SQLite do servidor.
- [x] Rotas `/health`, `/notes`, `/sync/pull`, `/sync/push`.
- [x] Camada local de persistência + outbox no mobile.
- [x] Loop pull → merge → push → ack.
- [x] UI mínima para criar nota, listar, forçar sync e ver status.
- [ ] Testar o fluxo airplane mode → reconnect em um development build.
- [ ] Cobrir delete com tombstone em dois devices (próxima iteração).
