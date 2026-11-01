import type { SyncResult } from './engine';

export function formatSync(result: SyncResult) {
  if (result.status === 'ok') {
    return `pull ${result.pulled} · push ${result.pushed}`;
  }
  if (result.status === 'skipped') {
    return `sync pulado: ${result.reason}`;
  }
  return `erro: ${result.message}`;
}
