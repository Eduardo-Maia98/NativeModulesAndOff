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
- Backend com `/health`, `/notes`, `/sync/pull` e `/sync/push`.
- Tela inicial para criar notas no SQLite, ver outbox e disparar sync.

Specs: `specs/001-offline-first` e `specs/002-native-modules`.

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

1. Abra o app, crie uma nota — ela vai para o SQLite e para a outbox.
2. Ative airplane mode, crie outra, confirme que a UI continua funcionando.
3. Volte a rede e toque em **Sincronizar**.
4. Inspecione `GET http://localhost:3333/notes`.
5. O card **Turbo Module** mostra plataforma/modelo vindos de Kotlin/ObjC.

## Stack

| Camada | Lib |
| --- | --- |
| Mobile | Expo 58, RN New Architecture |
| DB local | `expo-sqlite` + Drizzle |
| Rede | `@react-native-community/netinfo` |
| Native | Turbo Module `native-device-bridge` |
| Backend | Fastify, Drizzle, better-sqlite3 |
| Contrato | Zod em `packages/shared` |
