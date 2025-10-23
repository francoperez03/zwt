import { Identity } from '@semaphore-protocol/identity';
import { IdentityData } from './types';

export function createIdentity(): IdentityData {
  const identity = new Identity();

  return {
    privateKey: identity.toString(),
    publicKey: identity.publicKey.toString(),
    commitment: identity.commitment.toString()
  };
}

export function importIdentity(privateKey: string): IdentityData {
  const identity = new Identity(privateKey);

  return {
    privateKey: identity.toString(),
    publicKey: identity.publicKey.toString(),
    commitment: identity.commitment.toString()
  };
}
