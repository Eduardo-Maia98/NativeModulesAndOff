# Spec 003 — Sync automático e inspeção em abas

## Problema

O sync hoje depende de um botão. Isso esconde o loop da spec 001 e mistura captura, dump local e dump remoto na mesma tela. O `SafeAreaView` do React Native está depreciado.

## Decisão

- O sync deixa de ser manual. O app dispara o mesmo `pull → merge → push` sozinho.
- A UI ganha um bottom tab com três telas.
- Safe area vem de `react-native-safe-area-context`.

## Telas

1. **Adicionar** — captura de nota (composer), status de rede/outbox/último sync, card do Turbo Module. Lista visível das notas locais (sem tombstone), como a home atual, sem botão Sincronizar.
2. **Local** — dump da tabela SQLite `notes` no device, incluindo tombstones. Colunas: `id`, `title`, `body`, `updatedAt`, `deletedAt`.
3. **Backend** — dump da tabela `notes` do servidor via `GET /notes`, no mesmo formato. Composer nesta aba grava com `POST /notes` direto no SQLite do servidor (sem outbox local). O id nasce no servidor. O próximo pull traz a nota para o device. Falha de rede aparece na própria tela.

## Sync automático

Dispara quando:

- o app sobe e a rede está disponível
- a conexão volta de offline para online
- uma mutação local (criar/excluir) grava na outbox
- um intervalo curto passa (estudo: 5s) e há rede

Mutex continua no engine: um sync por vez. Se uma mutação cair no meio de um sync, enfileira uma nova passagem ao terminar.

Sem rede, a UI não bloqueia. Outbox cresce. Status (online/offline, tamanho da outbox, último resultado) permanece visível na aba Adicionar.

## Critérios de aceite

- Não existe botão de sync.
- Criar uma nota online aparece na aba Local na hora e, após o loop, na aba Backend.
- Criar uma nota offline aparece só na aba Local; ao reconectar, a aba Backend converge.
- Aba Local mostra tombstone (`deletedAt` preenchido) após excluir; Backend converge depois do loop.
- Criar na aba Backend aparece na tabela remota na hora e, após o pull, na aba Local.
- Conteúdo não fica sob notch/status bar nem sob a tab bar.

## Fora desta spec

- Sync nativo em background (WorkManager / BGTask). Continua recorte futuro.
- Edição de nota, auth, Expo Router.
