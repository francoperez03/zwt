import { Identity } from '@semaphore-protocol/identity';
import { IdentityData } from './types';

export function createIdentity(): IdentityData {
  const identity = new Identity();

  // Export the identity and convert to a simple string format
  const exported = identity.export();
  // Store as "trapdoor:nullifier" format (ensure they're strings)
  const privateKeyString = `${exported.trapdoor.toString()}:${exported.nullifier.toString()}`;

  return {
    privateKey: privateKeyString,
    publicKey: identity.publicKey.toString(),
    commitment: identity.commitment.toString()
  };
}

export function importIdentity(privateKey: string): IdentityData {
  // Parse the "trapdoor:nullifier" format back to object
  const [trapdoor, nullifier] = privateKey.split(':');
  const identity = new Identity({ trapdoor, nullifier });

  const exported = identity.export();
  const privateKeyString = `${exported.trapdoor}:${exported.nullifier}`;

  return {
    privateKey: privateKeyString,
    publicKey: identity.publicKey.toString(),
    commitment: identity.commitment.toString()
  };
}
