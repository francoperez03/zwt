import { Injectable } from '@nestjs/common';
import { verifyProof, ProofResult } from 'zwt-access-lib';

@Injectable()
export class SemaphoreService {
  private readonly commitments: Set<string> = new Set();
  private readonly usedNullifiers: Set<string> = new Set();

  registerCommitment(commitment: string): void {
    this.commitments.add(commitment);
  }

  getCommitments(): string[] {
    return Array.from(this.commitments);
  }

  async verifyProof(proofResult: ProofResult): Promise<boolean> {
    console.log('=== SemaphoreService.verifyProof DEBUG ===');
    console.log('Received proof result:', JSON.stringify(proofResult, null, 2));
    console.log('nullifierHash:', proofResult.nullifierHash);
    console.log('Used nullifiers:', Array.from(this.usedNullifiers));

    if (this.usedNullifiers.has(proofResult.nullifierHash)) {
      console.log('Nullifier already used!');
      return false;
    }

    try {
      const isValid = await verifyProof(proofResult);
      console.log('Proof verification result:', isValid);

      if (isValid) {
        this.usedNullifiers.add(proofResult.nullifierHash);
        console.log('Nullifier added to used set');
      }

      return isValid;
    } catch (error) {
      console.error('Error during proof verification:', error);
      return false;
    }
  }
}
