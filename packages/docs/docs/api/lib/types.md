---
sidebar_position: 4
---

# Types API

TypeScript type definitions for zwt-access-lib.

**File**: `packages/zwt-access-lib/src/types.ts`

## Interfaces

### IdentityData

Represents a cryptographic identity.

**Definition**:
```typescript
export interface IdentityData {
  privateKey: string;
  publicKey: string;
  commitment: string;
}
```

**Fields**:
- `privateKey` (string): Private key in `"trapdoor:nullifier"` format. **Keep secret!**
- `publicKey` (string): Public identifier derived from identity
- `commitment` (string): Poseidon hash of identity, used for group membership

**Example**:
```typescript
const identity: IdentityData = {
  privateKey: "12345678901234567890:98765432109876543210",
  publicKey: "11223344556677889900",
  commitment: "99887766554433221100"
};
```

**Used by**:
- [`createIdentity()`](identity#createidentity)
- [`importIdentity()`](identity#importidentity)
- [`generateProof()`](proof#generateproof)

---

### ProofInput

Input parameters for proof generation.

**Definition**:
```typescript
export interface ProofInput {
  identity: IdentityData;
  groupMembers: string[];
  signal: string;
  externalNullifier: string;
}
```

**Fields**:
- `identity` ([`IdentityData`](#identitydata)): Your cryptographic identity
- `groupMembers` (string[]): Array of all group member commitments
- `signal` (string): Binds proof to specific resource/action
- `externalNullifier` (string): Prevents replay attacks

**Example**:
```typescript
const input: ProofInput = {
  identity: myIdentity,
  groupMembers: ['commitment1', 'commitment2', 'commitment3'],
  signal: "12345678901234567890",
  externalNullifier: "98765432109876543210"
};

const proof = await generateProof(input);
```

**Used by**:
- [`generateProof()`](proof#generateproof)

---

### ProofResult

Result of proof generation, sent to backend for verification.

**Definition**:
```typescript
export interface ProofResult {
  proof: any;
  nullifierHash: string;
  externalNullifier: string;
  signal: string;
}
```

**Fields**:
- `proof` (any): The SNARK proof object (complex internal structure)
- `nullifierHash` (string): Unique identifier for this proof
- `externalNullifier` (string): Echo of input external nullifier
- `signal` (string): Echo of input signal

**Example**:
```typescript
const result: ProofResult = {
  proof: { /* complex SNARK data */ },
  nullifierHash: "12345678901234567890",
  externalNullifier: "98765432109876543210",
  signal: "11223344556677889900"
};

// Serialize for transmission
const header = JSON.stringify(result);
```

**Used by**:
- [`generateProof()`](proof#generateproof) (returns)
- [`verifyProof()`](proof#verifyproof) (accepts)
- Backend verification

---

### AccessContext

Context for accessing protected resources.

**Definition**:
```typescript
export interface AccessContext {
  signal: string;
  externalNullifier: string;
  epoch: number;
}
```

**Fields**:
- `signal` (string): Hash of endpoint + scope
- `externalNullifier` (string): Hash of endpoint + epoch
- `epoch` (number): Current epoch number

**Example**:
```typescript
const context: AccessContext = {
  signal: "12345678901234567890",
  externalNullifier: "98765432109876543210",
  epoch: 1234
};

// Use in proof generation
const proof = await generateProof({
  identity: myIdentity,
  groupMembers: allMembers,
  signal: context.signal,
  externalNullifier: context.externalNullifier
});
```

**Used by**:
- [`buildAccessContext()`](context#buildaccesscontext) (returns)
- [`generateProof()`](proof#generateproof) (uses signal and externalNullifier)

## Type Relationships

```
createIdentity() → IdentityData
                       ↓
                  ProofInput → generateProof() → ProofResult
                       ↑                             ↓
buildAccessContext() → AccessContext         verifyProof() → boolean
```

## Complete Type Example

```typescript
import {
  IdentityData,
  ProofInput,
  ProofResult,
  AccessContext
} from 'zwt-access-lib';

// 1. Identity
const identity: IdentityData = createIdentity();

// 2. Access context
const context: AccessContext = buildAccessContext('/protected/view');

// 3. Proof input
const input: ProofInput = {
  identity,
  groupMembers: ['comm1', 'comm2'],
  signal: context.signal,
  externalNullifier: context.externalNullifier
};

// 4. Generate proof
const result: ProofResult = await generateProof(input);

// 5. Verify
const isValid: boolean = await verifyProof(result);
```

## Source Code

Full source: `packages/zwt-access-lib/src/types.ts`

```typescript
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
```

## Related

- [Identity API](identity)
- [Proof API](proof)
- [Context API](context)
