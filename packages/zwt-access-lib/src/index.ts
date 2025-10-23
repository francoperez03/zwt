export * from './types';
export * from './identity';
export * from './proof';
export * from './context';

import { createIdentity, importIdentity } from './identity';
import { generateProof, verifyProof } from './proof';

export class SemaphoreAccess {
  static createIdentity = createIdentity;
  static importIdentity = importIdentity;
  static generateProof = generateProof;
  static verifyProof = verifyProof;
}
