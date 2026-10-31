# Constituição do NativeModulesAndOff

Projeto de estudo. O objetivo é entender, na prática, dois eixos:

1. Offline-first com SQLite no dispositivo e sincronização com um backend próprio.
2. Integração nativa via Turbo Modules escritos por nós.

## Princípios

- Spec primeiro. Nenhuma feature nova entra sem `spec.md`, `plan.md` e `tasks.md`.
- O app mobile é a fonte da verdade da UX: escrita local primeiro, sync depois.
- SQLite no device é o storage canônico do cliente. Não usar AsyncStorage como banco.
- Módulos nativos usam a New Architecture (Turbo Modules + Codegen). Sem Bridge legado.
- Backend e mobile compartilham contratos em `packages/shared`. Não duplicar tipos de sync.
- Código de estudo deve permanecer explícito. Prefira um fluxo simples e visível a um SDK opaco.
- Sem segredos no repositório. Use `.env` local.

## Recortes fora de escopo (por enquanto)

- Auth real, multi-tenant e billing.
- CRDT / merge campo a campo.
- Publicação de módulos no npm.
- Expo Go como alvo. Custom native code exige development build (`expo-dev-client`).
