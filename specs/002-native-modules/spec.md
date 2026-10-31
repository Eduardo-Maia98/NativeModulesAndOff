# Spec 002 — Turbo Modules nativos

## Problema

Além do fluxo offline, o projeto existe para estudarmos módulos nativos escritos por nós. O primeiro módulo não precisa ser um produto: precisa ser um caminho reproduzível até Kotlin/ObjC, Codegen e JSI.

## Decisão

Usamos **Turbo Native Modules** (React Native New Architecture + Codegen), não a Bridge antiga.

O primeiro módulo, `native-device-bridge`, expõe dados do device que o JS não deveria inventar:

- plataforma nativa
- modelo / nome do device
- se está em emulador/simulador
- um `echo` síncrono para validar a ida e volta JS → nativo

## Comportamento

`NativeDeviceBridge.getSnapshot()` retorna:

```ts
{
  platform: 'ios' | 'android',
  model: string,
  isEmulator: boolean,
  nativeTimestamp: number
}
```

`NativeDeviceBridge.echo(message: string)` devolve a mesma string prefixada com `[native]`.

A tela inicial do app mostra o snapshot. Se o módulo não estiver linkado (Expo Go), a UI mostra um erro explícito pedindo development build.

## Critérios de aceite

- `npx expo prebuild` + `npx expo run:ios|android` compilam o módulo.
- A home renderiza modelo e plataforma vindos do nativo.
- `echo('ping')` retorna `[native] ping`.

## Fora desta spec

- Views nativas (Fabric).
- Módulos em C++.
- Expo Modules API como caminho principal (fica documentado como alternativa, não como implementação).
