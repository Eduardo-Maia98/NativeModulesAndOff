import { echo, getSnapshot, type DeviceSnapshot } from 'native-device-bridge';

export type NativeStatus =
  | { ok: true; snapshot: DeviceSnapshot; echo: string }
  | { ok: false; message: string };

export function readNativeBridge(): NativeStatus {
  try {
    const snapshot = getSnapshot();
    return {
      ok: true,
      snapshot,
      echo: echo('ping'),
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}
