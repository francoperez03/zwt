---
sidebar_position: 1
---

# Identity API

Identity creation and management functions.

**File**: `packages/zwt-access-lib/src/identity.ts`

## Functions

### createIdentity()

Creates a new cryptographic identity using the Semaphore Protocol.

**Signature**:
```typescript
function createIdentity(): IdentityData
```

**Returns**: [`IdentityData`](types#identitydata)

**Example**:
```typescript
import { createIdentity } from 'zwt-access-lib';

const identity = createIdentity();
console.log(identity);
// {
//   privateKey: "12345678:87654321",
//   publicKey: "1122334455",
//   commitment: "9988776655"
// }
```

**Implementation Details**:
1. Creates new `Identity()` from Semaphore Protocol
2. Exports trapdoor and nullifier
3. Formats as `"trapdoor:nullifier"` string
4. Returns `IdentityData` object

**Source** (`packages/zwt-access-lib/src/identity.ts:4-17`):
```typescript
export function createIdentity(): IdentityData {
  const identity = new Identity();
  
  const exported = identity.export();
  const privateKeyString = `${exported.trapdoor.toString()}:${exported.nullifier.toString()}`;
  
  return {
    privateKey: privateKeyString,
    publicKey: identity.publicKey.toString(),
    commitment: identity.commitment.toString()
  };
}
```

---

### importIdentity()

Imports an identity from a private key string.

**Signature**:
```typescript
function importIdentity(privateKey: string): IdentityData
```

**Parameters**:
- `privateKey` (string): Private key in `"trapdoor:nullifier"` format

**Returns**: [`IdentityData`](types#identitydata)

**Example**:
```typescript
import { importIdentity } from 'zwt-access-lib';

const privateKey = "12345678:87654321";
const identity = importIdentity(privateKey);

console.log(identity.commitment);
// "9988776655"
```

**Error Handling**:
```typescript
// Invalid format
importIdentity("invalid");  // May throw error

// Correct format
importIdentity("123:456");  // ✓ Works
```

**Source** (`packages/zwt-access-lib/src/identity.ts:19-32`):
```typescript
export function importIdentity(privateKey: string): IdentityData {
  const [trapdoor, nullifier] = privateKey.split(':');
  const identity = new Identity({ trapdoor, nullifier });
  
  const exported = identity.export();
  const privateKeyString = `${exported.trapdoor}:${exported.nullifier}`;
  
  return {
    privateKey: privateKeyString,
    publicKey: identity.publicKey.toString(),
    commitment: identity.commitment.toString()
  };
}
```

## Types

### IdentityData

See [Types API → IdentityData](types#identitydata)

## Related

- [Proof API](proof) - Using identities to generate proofs
- [Types API](types) - Type definitions
- [Identity Concept](../../concepts/identity) - Understanding identities
