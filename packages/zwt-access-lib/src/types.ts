export interface IdentityData {
  privateKey: string;
  publicKey: string;
  commitment: string;
}

export interface ProofInput {
  identity: IdentityData;
  groupMembers: string[];
  signal: string;
  externalNullifier: string;
}

// PackedGroth16Proof from @zk-kit/utils is a tuple of 8 numeric strings
export type PackedGroth16Proof = [string, string, string, string, string, string, string, string];

export interface ProofResult {
  proof: PackedGroth16Proof;
  nullifierHash: string;
  externalNullifier: string;
  signal: string;
  merkleTreeDepth: number;
  merkleTreeRoot: string;
}

export interface AccessContext {
  signal: string;
  externalNullifier: string;
  epoch: number;
}
