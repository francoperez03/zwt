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
    if (this.usedNullifiers.has(proofResult.nullifierHash)) {
      return false;
    }

    const isValid = await verifyProof(proofResult);

    if (isValid) {
      this.usedNullifiers.add(proofResult.nullifierHash);
    }

    return isValid;
  }
}
