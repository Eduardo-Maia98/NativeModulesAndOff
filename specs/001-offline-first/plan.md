# Plano 001 — Offline-first

## Stack

- Cliente: Expo, `expo-sqlite`, Drizzle ORM, `@react-native-community/netinfo`, `expo-crypto`.
- Servidor: Fastify, Drizzle, `better-sqlite3`, Zod.
- Contrato: `packages/shared`.

## Banco local (mobile)

Tabelas: `notes`, `outbox`, `sync_state`.

A outbox guarda `{ id, noteId, operation, payload, createdAt, attempts }`.

`sync_state` guarda o cursor `lastPulledAt`.

## Banco do servidor

Tabela `notes` com o mesmo formato canônico da spec. Sem outbox.

## API

| Método | Rota | Papel |
| --- | --- | --- |
| GET | `/health` | Liveness |
| GET | `/notes` | Debug / inspeção |
| GET | `/sync/pull?since=<ms>` | Mudanças com `updatedAt > since` |
| POST | `/sync/push` | Aplica lote da outbox |

## Loop de sync no app

1. Se `NetInfo` reportar offline, sair.
2. Pull com o cursor local.
3. Para cada row remota, aplicar LWW + tombstone.
4. Push da outbox em ordem de `createdAt`.
5. Remover items ackados. Atualizar cursor.

## Observabilidade de estudo

Tela inicial mostra: online/offline, quantidade de notas, tamanho da outbox, último sync.
