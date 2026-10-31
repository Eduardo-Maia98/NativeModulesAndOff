import { TurboModuleRegistry, type TurboModule } from 'react-native';

export type DeviceSnapshot = {
  platform: string;
  model: string;
  isEmulator: boolean;
  nativeTimestamp: number;
};

export interface Spec extends TurboModule {
  getSnapshot(): DeviceSnapshot;
  echo(message: string): string;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeDeviceBridge');
