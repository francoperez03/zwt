---
sidebar_position: 3
---

# Context API

Build access contexts for zero-knowledge proofs.

**File**: `packages/zwt-access-lib/src/context.ts`

## Functions

### buildAccessContext()

Builds an access context with signal and external nullifier for proof generation.

**Signature**:
```typescript
function buildAccessContext(
  endpoint: string,
  scope?: string,
  ttlMs?: number
): AccessContext
```

**Parameters**:
- `endpoint` (string): The resource endpoint (e.g., `/protected/view`)
- `scope` (string, optional): Access scope (default: `'default'`)
- `ttlMs` (number, optional): Time-to-live in milliseconds (default: `3600000` = 1 hour)

**Returns**: [`AccessContext`](types#accesscontext)

**Example**:
```typescript
import { buildAccessContext } from 'zwt-access-lib';

// Basic usage
const context = buildAccessContext('/protected/view');

// With custom scope
const context = buildAccessContext('/protected/view', 'admin');

// With custom TTL (10 minutes)
const context = buildAccessContext('/protected/view', 'default', 600000);

console.log(context);
// {
//   signal: "12345678901234567890",
//   externalNullifier: "98765432109876543210",
//   epoch: 1234
// }
```

**How It Works**:

1. **Calculate Epoch**:
   ```typescript
   epoch = floor(currentTime / ttlMs)
   ```

2. **Generate Signal** (binds to resource + scope):
   ```typescript
   signal = poseidon([hash(endpoint), hash(scope)])
   ```

3. **Generate External Nullifier** (binds to resource + time):
   ```typescript
   externalNullifier = poseidon([hash(endpoint), epoch])
   ```

**Epoch Examples**:

```typescript
// 1 hour TTL
ttlMs = 3600000
// Hour 0-1: epoch 0
// Hour 1-2: epoch 1
// Hour 2-3: epoch 2

// 1 day TTL
ttlMs = 86400000
// Day 1: epoch 0
// Day 2: epoch 1

// 1 minute TTL (testing)
ttlMs = 60000
// Minute 0: epoch 0
// Minute 1: epoch 1
```

**Source** (`packages/zwt-access-lib/src/context.ts:4-19`):
```typescript
export function buildAccessContext(
  endpoint: string,
  scope: string = 'default',
  ttlMs: number = 3600000
): AccessContext {
  const epoch = Math.floor(Date.now() / ttlMs);
  
  const signal = poseidon2([BigInt(hashString(endpoint)), BigInt(hashString(scope))]).toString();
  const externalNullifier = poseidon2([BigInt(hashString(endpoint)), BigInt(epoch)]).toString();
  
  return {
    signal,
    externalNullifier,
    epoch
  };
}
```

## Helper Functions

### hashString()

Internal helper to hash strings to numbers.

**Signature**:
```typescript
function hashString(str: string): string
```

**Note**: This is an internal function and not exported. It's a simple hash for demonstration purposes.

**Source** (`packages/zwt-access-lib/src/context.ts:21-29`):
```typescript
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString();
}
```

## Usage Patterns

### Same Resource, Different Scopes

```typescript
const readContext = buildAccessContext('/api/document', 'read');
const writeContext = buildAccessContext('/api/document', 'write');

// Different signals (different proofs needed)
console.log(readContext.signal !== writeContext.signal);  // true

// Same external nullifier (same epoch)
console.log(readContext.externalNullifier === writeContext.externalNullifier);  // true
```

### Different Resources

```typescript
const doc1 = buildAccessContext('/api/document/1');
const doc2 = buildAccessContext('/api/document/2');

// Different signals AND different external nullifiers
console.log(doc1.signal !== doc2.signal);  // true
console.log(doc1.externalNullifier !== doc2.externalNullifier);  // true
```

### Time-Based Access

```typescript
const context1 = buildAccessContext('/api/resource');
// ... wait for epoch to change ...
const context2 = buildAccessContext('/api/resource');

// Same signal, different external nullifier
console.log(context1.signal === context2.signal);  // true
console.log(context1.externalNullifier !== context2.externalNullifier);  // true
```

## Common TTL Values

```typescript
// Per minute (testing)
buildAccessContext(endpoint, scope, 60000);

// Per 5 minutes
buildAccessContext(endpoint, scope, 300000);

// Per hour (default)
buildAccessContext(endpoint, scope, 3600000);

// Per day
buildAccessContext(endpoint, scope, 86400000);

// Per week
buildAccessContext(endpoint, scope, 604800000);
```

## Types

- [`AccessContext`](types#accesscontext)

## Complete Example

```typescript
import { buildAccessContext, generateProof } from 'zwt-access-lib';

// Build context for hourly access
const context = buildAccessContext('/protected/view', 'default', 3600000);

// Use in proof generation
const proof = await generateProof({
  identity: myIdentity,
  groupMembers: allMembers,
  signal: context.signal,
  externalNullifier: context.externalNullifier
});

// Access the resource
axios.get('/protected/view', {
  headers: { 'X-ZWT-TOKEN': JSON.stringify(proof) }
});
```

## Related

- [Proof API](proof) - Using contexts in proof generation
- [Access Control Concept](../../concepts/access-control)
- [Types API](types#accesscontext)
