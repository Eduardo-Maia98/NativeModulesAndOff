import NativeDeviceBridge, {
  type DeviceSnapshot,
} from './NativeNativeDeviceBridge';

export type { DeviceSnapshot };

export function getSnapshot(): DeviceSnapshot {
  return NativeDeviceBridge.getSnapshot();
}

export function echo(message: string): string {
  return NativeDeviceBridge.echo(message);
}
