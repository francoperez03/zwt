import { Group } from '@semaphore-protocol/group';
import { Identity } from '@semaphore-protocol/identity';
import { generateProof as semaphoreGenerateProof, verifyProof as semaphoreVerifyProof } from '@semaphore-protocol/proof';
import { ProofInput, ProofResult } from './types';

export async function generateProof(input: ProofInput): Promise<ProofResult> {
  const { identity, groupMembers, signal, externalNullifier } = input;

  const group = new Group(groupMembers);
  // Parse the "trapdoor:nullifier" format
  const [trapdoor, nullifier] = identity.privateKey.split(':');
  const identityObject = new Identity({ trapdoor, nullifier });

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
