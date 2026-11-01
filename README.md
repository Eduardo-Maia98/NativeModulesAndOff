# NativeModulesAndOff

Projeto de estudo em Spec-Driven Development: app Expo **offline-first** (SQLite local + sync) e **Turbo Modules** nativos escritos por nós.

```
NativeModulesAndOff/
  specs/                 # fonte da verdade (SDD)
  apps/mobile            # Expo SDK 58 + New Architecture
  apps/api               # Fastify + SQLite do servidor
  packages/shared        # contratos Zod de Note/Sync
```

## O que já está configurado

- Monorepo npm workspaces.
- App Expo com `expo-sqlite`, Drizzle, NetInfo, `expo-crypto` e `expo-dev-client`.
- Turbo Module local `native-device-bridge` (Kotlin + Objective-C + Codegen).
- Backend com `/health`, `GET/POST /notes`, `/sync/pull` e `/sync/push`.
- Bottom tabs: adicionar notas, dump da tabela SQLite local e dump da tabela do backend.
- Sync automático (rede, mutação local e intervalo de 5s). Sem botão manual.

Specs: `specs/001-offline-first`, `specs/002-native-modules` e `specs/003-auto-sync-tabs`.

## Setup

```bash
npm install
```

No mobile, trava as versões nativas do Expo:

```bash
cd apps/mobile
npx expo install expo-sqlite expo-dev-client expo-crypto @react-native-community/netinfo
```

## Rodar o backend

```bash
npm run api
```

API em `http://localhost:3333`.

## Rodar o app (development build)

Turbo Modules **não** carregam no Expo Go. Precisa de prebuild:

```bash
cd apps/mobile
npx expo prebuild
npx expo run:ios
# ou
npx expo run:android
```

Emulador Android fala com a API em `http://10.0.2.2:3333`. iOS Simulator usa `http://localhost:3333`. Override: `EXPO_PUBLIC_API_URL`.

## Como estudar o fluxo

1. Abra o app na aba **Adicionar**, crie uma nota — ela vai para o SQLite e para a outbox.
2. Confira a aba **Local** (tabela `notes` do device, incluindo tombstones).
3. Ative airplane mode, crie outra, confirme que a UI continua funcionando.
4. Volte a rede — o sync corre sozinho. A aba **Backend** deve convergir.
5. Inspecione `GET http://localhost:3333/notes`.
6. O card **Turbo Module** mostra plataforma/modelo vindos de Kotlin/ObjC.

## Stack

| Camada | Lib |
| --- | --- |
| Mobile | Expo 58, RN New Architecture |
| DB local | `expo-sqlite` + Drizzle |
| Rede | `@react-native-community/netinfo` |
| Native | Turbo Module `native-device-bridge` |
| Backend | Fastify, Drizzle, better-sqlite3 |
| Contrato | Zod em `packages/shared` |
