import type { DeviceSnapshot } from './NativeNativeDeviceBridge';

export type { DeviceSnapshot };

export function getSnapshot(): DeviceSnapshot {
  throw new Error(
    'native-device-bridge so funciona em development build. Rode npx expo prebuild e depois npm run ios ou npm run android.'
  );
}

export function echo(_message: string): string {
  throw new Error(
    'native-device-bridge so funciona em development build. Rode npx expo prebuild e depois npm run ios ou npm run android.'
  );
}
