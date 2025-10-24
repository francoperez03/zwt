---
sidebar_position: 3
---

# Semaphore Protocol

Deep dive into the Semaphore Protocol v4 that powers ZWT.

## What is Semaphore?

**Semaphore** is a zero-knowledge protocol that allows users to:
1. Prove they're part of a group
2. Send signals anonymously
3. Prevent double-signaling

Official site: [semaphore.pse.dev](https://semaphore.pse.dev)

## Core Components

### 1. Identity

A Semaphore identity consists of:

```typescript
{
  trapdoor: BigInt,    // Random secret value
  nullifier: BigInt,   // Random secret value
  commitment: BigInt   // poseidon(trapdoor, nullifier)
}
```

Created using `@semaphore-protocol/identity`:

```typescript
import { Identity } from '@semaphore-protocol/identity';

const identity = new Identity();
// or
const identity = new Identity({ trapdoor, nullifier });
```

### 2. Group

A Semaphore group is a **Merkle tree** of commitments:

```typescript
import { Group } from '@semaphore-protocol/group';

const group = new Group([commitment1, commitment2, commitment3]);
```

Properties:
- `group.root` - Merkle tree root
- `group.members` - Array of commitments
- `group.depth` - Tree depth

### 3. Proof

A Semaphore proof proves:
- You know an identity in the group
- You're sending a specific signal
- Your nullifier hash is unique for this context

```typescript
import { generateProof } from '@semaphore-protocol/proof';

const proof = await generateProof(
  identity,           // Your identity object
  group,              // The group object
  externalNullifier,  // Context identifier
  signal              // Message/action you're proving for
);
```

## How Semaphore Works

### Step 1: Identity Creation

```typescript
const identity = new Identity();
const commitment = identity.commitment;
```

Your **commitment** is your public identifier in the group.

### Step 2: Group Registration

```typescript
group.addMember(commitment);
```

Your commitment is added to the Merkle tree.

### Step 3: Proof Generation

To prove membership and send a signal:

```typescript
const proof = await generateProof(
  identity,
  group,
  externalNullifier,  // Prevents replay
  signal              // What you're proving
);
```

### Step 4: Proof Verification

```typescript
import { verifyProof } from '@semaphore-protocol/proof';

await verifyProof(proof);  // Returns true/false
```

## Semaphore Math

### Commitment Calculation

```
commitment = poseidon([trapdoor, nullifier])
```

### Nullifier Hash Calculation

```
nullifierHash = poseidon([nullifier, externalNullifier])
```

### Merkle Tree

Binary tree where:
- **Leaves** = User commitments
- **Nodes** = poseidon(left_child, right_child)
- **Root** = Single hash representing entire group

### Circuit Verification

The Semaphore circuit verifies:

```
1. commitment = poseidon(trapdoor, nullifier)
2. commitment is in Merkle tree with root R
3. nullifierHash = poseidon(nullifier, externalNullifier)
4. signal is bound to the proof
```

All without revealing trapdoor, nullifier, or which leaf you are!

## Semaphore in ZWT

### ZWT's Identity Wrapper

```typescript
// packages/zwt-access-lib/src/identity.ts
export function createIdentity(): IdentityData {
  const identity = new Identity();  // Semaphore identity
  const exported = identity.export();

  return {
    privateKey: `${exported.trapdoor}:${exported.nullifier}`,
    publicKey: identity.publicKey.toString(),
    commitment: identity.commitment.toString()
  };
}
```

### ZWT's Proof Wrapper

```typescript
// packages/zwt-access-lib/src/proof.ts
export async function generateProof(input: ProofInput): Promise<ProofResult> {
  const group = new Group(input.groupMembers);  // Semaphore group
  const [trapdoor, nullifier] = input.identity.privateKey.split(':');
  const identityObject = new Identity({ trapdoor, nullifier });

  const proof = await semaphoreGenerateProof(
    identityObject,
    group,
    input.externalNullifier,
    input.signal
  );

  return {
    proof: proof,
    nullifierHash: proof.nullifier.toString(),
    externalNullifier: input.externalNullifier,
    signal: input.signal
  };
}
```

## Semaphore v4 Features

### New in v4

1. **Improved Performance**: Faster proof generation
2. **Better Types**: Full TypeScript support
3. **Modular Packages**: Separate identity, group, proof packages
4. **Updated Circuits**: More efficient ZK circuits
5. **Web Support**: Works in browsers via WASM

### Semaphore Packages Used

```json
{
  "@semaphore-protocol/identity": "^4.0.3",
  "@semaphore-protocol/group": "^4.0.3",
  "@semaphore-protocol/proof": "^4.0.3"
}
```

## Use Cases Beyond ZWT

Semaphore is used for:

1. **Anonymous Voting**: Prove you're eligible without revealing identity
2. **Whistleblowing**: Verified employees report anonymously
3. **Private Surveys**: Authenticated responses without tracking
4. **Anonymous Messaging**: Send messages provably from group members
5. **RLN (Rate Limiting Nullifiers)**: Prevent spam while preserving privacy

## Nullifier Strategy

### What is a Nullifier?

A **nullifier** is a unique value that:
- Proves you sent a signal
- Prevents sending the same signal twice
- Doesn't reveal your identity

### External Nullifier

The **external nullifier** creates different contexts:

```typescript
externalNullifier1 = "vote_proposal_123"
externalNullifier2 = "vote_proposal_456"
```

Same identity:
- Different external nullifiers → Different nullifier hashes
- Can signal once per external nullifier

### ZWT's Epoch-Based Nullifiers

```typescript
// packages/zwt-access-lib/src/context.ts
export function buildAccessContext(
  endpoint: string,
  scope: string = 'default',
  ttlMs: number = 3600000  // 1 hour
): AccessContext {
  const epoch = Math.floor(Date.now() / ttlMs);

  const externalNullifier = poseidon2([
    BigInt(hashString(endpoint)),
    BigInt(epoch)
  ]).toString();

  return { signal, externalNullifier, epoch };
}
```

New epoch → New external nullifier → Can signal again!

## Security Model

### What Semaphore Guarantees

✅ **Anonymity**: Can't determine which member created proof
✅ **Unforgeability**: Non-members can't create valid proofs
✅ **Non-Frameability**: Can't create proof for someone else
✅ **Unlinkability**: Can't link two proofs to same identity (different nullifiers)

### What Semaphore Doesn't Prevent

❌ **Replay attacks**: Must track nullifier hashes externally
❌ **Sybil attacks**: One person can create multiple identities
❌ **Group enumeration**: Group members are public
❌ **Collusion**: Multiple users could share identities

## Performance Characteristics

### Proof Generation

Depends on group size (Merkle tree depth):

```
Tree Depth = log2(group_size)

10 members   → depth 4  → ~1-2 sec
100 members  → depth 7  → ~2-3 sec
1000 members → depth 10 → ~3-5 sec
```

### Proof Verification

Constant time: ~100-500ms regardless of group size

### Proof Size

~200 bytes (compressed SNARK proof)

## Advanced Topics

### Custom Signals

Signals can be any value:

```typescript
// Simple string
signal = "I vote YES"

// JSON data
signal = JSON.stringify({ vote: "yes", timestamp: Date.now() })

// Hash of data
signal = poseidon([data1, data2]).toString()
```

### Multiple Groups

Users can be in multiple groups:

```typescript
const group1 = new Group([...]);  // Voters group
const group2 = new Group([...]);  // Admins group

// Prove membership in group1
const proof1 = await generateProof(identity, group1, ...);

// Prove membership in group2
const proof2 = await generateProof(identity, group2, ...);
```

### Dynamic Groups

Groups can change:

```typescript
group.addMember(newCommitment);
group.removeMember(index);
```

But proofs must use current group state!

## Resources

- [Semaphore Documentation](https://docs.semaphore.pse.dev)
- [Semaphore GitHub](https://github.com/semaphore-protocol/semaphore)
- [Semaphore Community](https://semaphore.pse.dev/community)
- [ZK Proof Standards](https://zkproof.org)

## Next Steps

- [Access Control](access-control) - Using Semaphore for authentication
- [Proof API Reference](../api/lib/proof) - ZWT's proof implementation
- [Context API](../api/lib/context) - Building access contexts
