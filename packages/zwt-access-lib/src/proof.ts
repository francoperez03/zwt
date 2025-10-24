import { Group } from '@semaphore-protocol/group';
import { Identity } from '@semaphore-protocol/identity';
import { generateProof as semaphoreGenerateProof, verifyProof as semaphoreVerifyProof } from '@semaphore-protocol/proof';
import { ProofInput, ProofResult } from './types';

export async function generateProof(input: ProofInput): Promise<ProofResult> {
  const { identity, groupMembers, signal, externalNullifier } = input;

  const group = new Group(groupMembers);
  // In Semaphore v4, import() accepts a string directly
  const identityObject = Identity.import(identity.privateKey);

  const proof = await semaphoreGenerateProof(
    identityObject,
    group,
    externalNullifier,
    signal
  );

  return {
    proof: proof,
    nullifierHash: proof.nullifier.toString(),
    externalNullifier,
    signal
  };
}

export async function verifyProof(proofResult: ProofResult): Promise<boolean> {
  try {
    await semaphoreVerifyProof(proofResult.proof);
    return true;
  } catch (error) {
    return false;
  }
}
