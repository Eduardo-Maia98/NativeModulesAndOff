# Spec 001 — Offline-first com SQLite

## Problema

Queremos um app que continue utilizável sem rede. O usuário cria e edita notas no device; quando a rede volta, as mudanças sobem para o backend e o device baixa o que mudou em outros clientes.

## Atores

- Estudante/dev usando o app Expo.
- Backend local (`apps/api`) simulando o servidor de sync.

## Domínio

Uma **nota** tem:

| Campo | Tipo | Regra |
| --- | --- | --- |
| `id` | UUID gerado no cliente | Nunca reescrito pelo servidor |
| `title` | string | Obrigatório |
| `body` | string | Pode ser vazio |
| `updatedAt` | epoch ms | Sempre avança em escrita local ou merge |
| `deletedAt` | epoch ms ou null | Tombstone. Não hard-delete no cliente |

## Comportamento

1. Toda mutação grava no SQLite imediatamente e enfileira um item na outbox.
2. A UI lê só do SQLite.
3. O sync roda em um loop com mutex: pull → merge → push → ack.
4. Merge é last-write-wins por `updatedAt`. Tombstone remoto vence.
5. Sem rede, o app não bloqueia. A outbox cresce e o status fica visível.

## Critérios de aceite (estudo)

- Criar/editar/excluir uma nota com o device offline.
- Reconectar e ver a nota no backend (`GET /notes`).
- Um segundo pull não duplica a nota.
- Deletar offline não "ressuscita" a nota depois do pull.

## Fora desta spec

- Login, conflitos campo a campo, sync em background nativo (WorkManager/BGTask). Isso pode virar `004+`.
- Disparo automático do loop e abas de inspeção: spec `003`.
