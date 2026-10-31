# Plano 002 — Turbo Modules

## Por que Turbo Modules neste repo

Expo Modules API também usa JSI e é mais ergonômica. Este projeto escolhe Turbo Modules de propósito: queremos o fluxo de Codegen (`NativeXxx.ts` → spec gerada → Kotlin/ObjC).

## Forma do pacote

Biblioteca local gerada com `create-react-native-library --local --type turbo-module --languages kotlin-objc`.

Fica em `modules/native-device-bridge` dentro do app Expo, autolinkada.

## Superfície nativa

- Spec JS: `NativeDeviceBridge.ts` com `TurboModuleRegistry.getEnforcing`.
- iOS: Objective-C++ implementando a spec gerada.
- Android: Kotlin implementando a spec gerada.

## App host

- New Architecture ligada (padrão do SDK atual).
- `expo-dev-client` instalado. Expo Go não carrega nosso módulo.
- Prebuild gera `ios/` e `android/` (gitignored no app).

## Próximos módulos (não nesta entrega)

Um candidato natural é um worker nativo de sync (background fetch / WorkManager) lendo a mesma SQLite. Isso vira spec `003` quando formos estudá-lo.
