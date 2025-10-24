import { Group } from '@semaphore-protocol/group';
import { Identity } from '@semaphore-protocol/identity';
import { generateProof as semaphoreGenerateProof, verifyProof as semaphoreVerifyProof } from '@semaphore-protocol/proof';
import { ProofInput, ProofResult } from './types';

export async function generateProof(input: ProofInput): Promise<ProofResult> {
  const { identity, groupMembers, signal, externalNullifier } = input;

  const group = new Group(groupMembers);
  const identityObject = Identity.import(identity.privateKey);

  // Semaphore v4 returns a full proof object
  const fullProof = await semaphoreGenerateProof(
    identityObject,
    group,
    externalNullifier,
    signal
  );

  console.log('Semaphore v4 full proof:', fullProof);

  // Map to ProofResult format expected by backend
  // In v4, the proof points are in fullProof.points
  return {
    proof: fullProof.points,
    nullifierHash: fullProof.nullifier.toString(),
    externalNullifier: fullProof.scope.toString(),
    signal: fullProof.message.toString(),
    merkleTreeDepth: fullProof.merkleTreeDepth,
    merkleTreeRoot: fullProof.merkleTreeRoot.toString()
  };
}

export async function verifyProof(proofResult: ProofResult): Promise<boolean> {
  try {
    // Semaphore v4 verifyProof expects the full proof object
    // Reconstruct it from our ProofResult format
    const fullProof = {
      points: proofResult.proof,
      merkleTreeDepth: proofResult.merkleTreeDepth,
      merkleTreeRoot: proofResult.merkleTreeRoot,
      nullifier: proofResult.nullifierHash,
      scope: proofResult.externalNullifier,
      message: proofResult.signal
    };

    await semaphoreVerifyProof(fullProof);
    return true;
  } catch (error) {
    console.error('Proof verification failed:', error);
    return false;
  }
}
