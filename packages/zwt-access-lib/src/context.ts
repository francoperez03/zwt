import { poseidon2 } from 'poseidon-lite';
import { AccessContext } from './types';

export function buildAccessContext(
  endpoint: string,
  scope: string = 'default',
  ttlMs: number = 3600000
): AccessContext {
  const epoch = Math.floor(Date.now() / ttlMs);

  const signal = poseidon2([BigInt(hashString(endpoint)), BigInt(hashString(scope))]).toString();
  const externalNullifier = poseidon2([BigInt(hashString(endpoint)), BigInt(epoch)]).toString();

  return {
    signal,
    externalNullifier,
    epoch
  };
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString();
}
