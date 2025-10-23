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

export interface ProofResult {
  proof: any;
  nullifierHash: string;
  externalNullifier: string;
  signal: string;
}

export interface AccessContext {
  signal: string;
  externalNullifier: string;
  epoch: number;
}
