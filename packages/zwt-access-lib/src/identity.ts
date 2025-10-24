import { Identity } from '@semaphore-protocol/identity';
import { IdentityData } from './types';

export function createIdentity(): IdentityData {
  const identity = new Identity();

  // In Semaphore v4, export() returns a string directly
  const privateKeyString = identity.export();

  return {
    privateKey: privateKeyString,
    publicKey: identity.publicKey.toString(),
    commitment: identity.commitment.toString()
  };
}

export function importIdentity(privateKey: string): IdentityData {
  // In Semaphore v4, import() accepts a string directly
  const identity = Identity.import(privateKey);

  return {
    privateKey: identity.export(),
    publicKey: identity.publicKey.toString(),
    commitment: identity.commitment.toString()
  };
}
