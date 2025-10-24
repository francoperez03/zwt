---
sidebar_position: 2
---

# Proof API

Zero-knowledge proof generation and verification.

**File**: `packages/zwt-access-lib/src/proof.ts`

## Functions

### generateProof()

Generates a zero-knowledge proof of group membership.

**Signature**:
```typescript
async function generateProof(input: ProofInput): Promise<ProofResult>
```

**Parameters**:
- `input` ([`ProofInput`](types#proofinput)): Proof input parameters

**Returns**: `Promise<`[`ProofResult`](types#proofresult)`>`

**Example**:
```typescript
import { generateProof, buildAccessContext } from 'zwt-access-lib';

const context = buildAccessContext('/protected/view');

const proof = await generateProof({
  identity: myIdentity,
  groupMembers: ['commitment1', 'commitment2', 'commitment3'],
  signal: context.signal,
  externalNullifier: context.externalNullifier
});

console.log(proof.nullifierHash);
// "12345678901234567890"
```

**Performance**:
- **Time**: 1-5 seconds (depends on group size)
- **Blocking**: Yes (async but computationally intensive)
- **Recommendation**: Show loading indicator

**Error Conditions**:
```typescript
// Identity not in group
await generateProof({ ... });
// Error: Identity commitment not found in group

// Invalid identity format
await generateProof({ identity: { privateKey: "invalid" }, ... });
// Error: Failed to parse identity
```

**Source** (`packages/zwt-access-lib/src/proof.ts:6-27`):
```typescript
export async function generateProof(input: ProofInput): Promise<ProofResult> {
  const { identity, groupMembers, signal, externalNullifier } = input;
  
  const group = new Group(groupMembers);
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
```

---

### verifyProof()

Verifies a zero-knowledge proof cryptographically.

**Signature**:
```typescript
async function verifyProof(proofResult: ProofResult): Promise<boolean>
```

**Parameters**:
- `proofResult` ([`ProofResult`](types#proofresult)): Proof to verify

**Returns**: `Promise<boolean>` - `true` if valid, `false` if invalid

**Example**:
```typescript
import { verifyProof } from 'zwt-access-lib';

const isValid = await verifyProof(proofResult);

if (isValid) {
  console.log("✓ Proof is valid");
} else {
  console.log("✗ Proof is invalid");
}
```

**Performance**:
- **Time**: 100-500ms (constant, independent of group size)
- **Recommendation**: Can be done without loading indicator

**Note**: This only verifies cryptographic validity. You must also check if the nullifier was used before to prevent replay attacks.

**Source** (`packages/zwt-access-lib/src/proof.ts:29-36`):
```typescript
export async function verifyProof(proofResult: ProofResult): Promise<boolean> {
  try {
    await semaphoreVerifyProof(proofResult.proof);
    return true;
  } catch (error) {
    return false;
  }
}
```

## Types

- [`ProofInput`](types#proofinput)
- [`ProofResult`](types#proofresult)

## Complete Example

```typescript
import { createIdentity, generateProof, verifyProof, buildAccessContext } from 'zwt-access-lib';

// 1. Create identity
const identity = createIdentity();

// 2. Simulate group (in real app, fetch from server)
const groupMembers = [identity.commitment, 'other1', 'other2'];

// 3. Build context
const context = buildAccessContext('/api/protected');

// 4. Generate proof
const proof = await generateProof({
  identity,
  groupMembers,
  signal: context.signal,
  externalNullifier: context.externalNullifier
});

// 5. Verify proof
const isValid = await verifyProof(proof);
console.log('Valid:', isValid);  // true
```

## Related

- [Context API](context) - Building access contexts
- [Zero-Knowledge Proofs Concept](../../concepts/zero-knowledge-proofs)
- [Semaphore Protocol](../../concepts/semaphore-protocol)
