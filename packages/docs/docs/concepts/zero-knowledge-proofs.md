---
sidebar_position: 2
---

# Zero-Knowledge Proofs

Understanding the cryptographic foundation of ZWT.

## What is a Zero-Knowledge Proof?

A **zero-knowledge proof** (ZKP) allows you to prove you know something **without revealing what you know**.

In ZWT:
- **You prove**: You're a member of the group
- **You don't reveal**: Which specific member you are

## The Magic of ZKPs

### Traditional Authentication

```
Server: "What's your password?"
You: "MyPassword123"
Server: ✅ "Correct, you're Alice!"
```

Problem: Server learns your password AND your identity.

### Zero-Knowledge Authentication

```
Server: "Prove you're in the group"
You: *generates proof*
Server: ✅ "Valid proof, you're a member!"
```

Advantage: Server knows you're a member, but **not which one**.

## How ZKPs Work in ZWT

### Proof Generation

```typescript
import { generateProof } from 'zwt-access-lib';

const proof = await generateProof({
  identity: myIdentity,           // Your secret identity
  groupMembers: [...],            // All commitments in the group
  signal: "endpoint_hash",        // What you're proving for
  externalNullifier: "epoch_hash" // Prevents reuse
});
```

### What Gets Generated

```typescript
{
  proof: { /* SNARK proof data */ },
  nullifierHash: "12345...",
  externalNullifier: "67890...",
  signal: "endpoint_hash"
}
```

### Proof Verification

```typescript
import { verifyProof } from 'zwt-access-lib';

const isValid = await verifyProof(proofResult);
// true = valid proof
// false = invalid proof
```

## The Math Behind It

### Merkle Tree

Group members form a **Merkle tree**:

```
         Root
        /    \
      H1      H2
     / \     / \
    C1 C2   C3 C4   ← Commitments
```

Your proof shows:
1. Your commitment is in the tree
2. You know the path to the root
3. You don't reveal which leaf you are

### Proof Circuit

The Semaphore circuit verifies:

```
1. commitment = poseidon(trapdoor, nullifier)
2. commitment ∈ Merkle tree
3. nullifierHash = poseidon(nullifier, externalNullifier)
4. signal is bound to proof
```

## Proof Components

### 1. Identity

Your secret values (trapdoor + nullifier):

```typescript
identity = { trapdoor: "...", nullifier: "..." }
```

### 2. Group Members

All commitments in the group:

```typescript
groupMembers = [
  "commitment1",
  "commitment2",
  "commitment3",
  ...
]
```

### 3. Signal

What action you're proving for:

```typescript
signal = poseidon([hash(endpoint), hash(scope)])
```

Binds the proof to a specific resource.

### 4. External Nullifier

Prevents replay attacks:

```typescript
externalNullifier = poseidon([hash(endpoint), epoch])
```

Different epoch = different nullifier = new proof possible.

### 5. Nullifier Hash

Unique identifier for this proof:

```typescript
nullifierHash = poseidon([nullifier, externalNullifier])
```

- Same identity + same epoch = same nullifier hash
- Different identity OR different epoch = different nullifier hash

## Proof Lifecycle

### 1. Generation (Client-Side)

```
Identity + Group + Context → Generate SNARK Proof → Proof Object
```

Time: ~2-5 seconds (depends on group size)

### 2. Transmission

```
Proof → Serialize to JSON → X-ZWT-TOKEN Header → Backend
```

### 3. Verification (Server-Side)

```
Extract Proof → Verify Cryptographically → Check Nullifier → Accept/Reject
```

Time: ~100-500ms

## Security Properties

### ✅ What ZKPs Guarantee

- **Soundness**: Can't create fake proof without group membership
- **Zero-Knowledge**: Proof reveals nothing about which member you are
- **Completeness**: Valid members can always create valid proofs
- **Non-Transferability**: Proofs are bound to specific contexts

### ❌ What ZKPs Don't Prevent

- **Replay in same epoch**: Same nullifier hash = rejected
- **Sybil attacks**: One user can have multiple identities
- **Group enumeration**: All commitments are public
- **Timing attacks**: Proof time might leak info (mitigated by constant time)

## Proof in Action

### Frontend Code

```typescript
// packages/frontend/src/apiClient.ts
api.interceptors.request.use(async (config) => {
  if (config.url?.startsWith('/protected')) {
    const { signal, externalNullifier } = buildAccessContext(
      config.url,
      'default',
      3600000  // 1 hour epochs
    );

    const proof = await generateProof({
      identity,
      groupMembers,
      signal,
      externalNullifier
    });

    config.headers['X-ZWT-TOKEN'] = JSON.stringify(proof);
  }
  return config;
});
```

### Backend Verification

```typescript
// packages/api-server/src/semaphore/semaphore.guard.ts
async canActivate(context: ExecutionContext): Promise<boolean> {
  const proofHeader = request.headers['X-ZWT-TOKEN'];
  const proofObject = JSON.parse(proofHeader);

  // Verify cryptographically
  const isValid = await this.semaphoreService.verifyProof(proofObject);

  if (!isValid) {
    throw new ForbiddenException('Invalid proof');
  }

  return true;
}
```

## Performance Considerations

### Generation Time

| Group Size | Generation Time |
|------------|----------------|
| 10 members | ~1-2 seconds |
| 100 members | ~2-3 seconds |
| 1,000 members | ~3-5 seconds |
| 10,000 members | ~5-10 seconds |

### Verification Time

Constant time: ~100-500ms (independent of group size)

### Optimization Tips

- **Cache group members**: Don't fetch on every request
- **Reuse Merkle tree**: Build once, use for multiple proofs
- **Proof caching**: Cache proofs until epoch changes
- **Batch verification**: Verify multiple proofs together (future)

## Advanced: SNARK Proofs

ZWT uses **SNARKs** (Succinct Non-Interactive Arguments of Knowledge):

- **Succinct**: Proofs are small (~200 bytes)
- **Non-Interactive**: No back-and-forth with verifier
- **Arguments**: Computationally sound
- **Knowledge**: Proves you know the secret

Semaphore specifically uses **Groth16** SNARK system.

## Common Issues

### Proof Generation Fails

```
Error: Identity not in group
```

**Solution**: Ensure your commitment is in `groupMembers` array

### Proof Verification Fails

```
Error: Invalid proof
```

**Causes**:
- Proof was tampered with
- Nullifier already used
- Wrong group members
- Epoch changed

### Performance Issues

```
Proof generation taking too long
```

**Solutions**:
- Reduce group size
- Use Web Workers (offload from main thread)
- Show loading indicator
- Consider proof caching

## Next Steps

- [Semaphore Protocol](semaphore-protocol) - The underlying protocol
- [Access Control](access-control) - Using proofs for authentication
- [Proof API Reference](../api/lib/proof) - Detailed API docs
