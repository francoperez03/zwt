---
sidebar_position: 1
---

# Identity

Understanding cryptographic identities in ZWT.

## What is an Identity?

In ZWT, an **identity** is a cryptographic keypair that represents a user. Unlike traditional authentication, this identity:

- Is generated **locally** (client or server-side)
- Never requires a username or password
- Proves group membership without revealing which member
- Cannot be linked across different proofs

## Identity Structure

An identity consists of three components:

### 1. Private Key

**Format**: `trapdoor:nullifier`

```typescript
"12345678901234567890:98765432109876543210"
```

- **Trapdoor**: Random secret value
- **Nullifier**: Second random secret value
- **Must be kept secret** - anyone with this can impersonate you

### 2. Public Key

A public identifier derived from the private key:

```typescript
"169449442...789"  // BigInt as string
```

- Can be shared publicly
- Used internally by Semaphore

### 3. Commitment

Your unique identifier in the group:

```typescript
"219849123...456"  // BigInt as string
```

- **Poseidon hash** of your identity
- Registered in the Semaphore group
- This is what proves you're a member

## Creating an Identity

### Using zwt-access-lib

```typescript
import { createIdentity } from 'zwt-access-lib';

const identity = createIdentity();

console.log(identity);
// {
//   privateKey: "...:...",
//   publicKey: "...",
//   commitment: "..."
// }
```

### What Happens Internally

1. Generate random `trapdoor` value
2. Generate random `nullifier` value
3. Create Semaphore Identity object
4. Compute Poseidon hash → commitment
5. Return all three values

### Backend Identity Creation

The backend creates identities via `/auth/signup`:

```typescript
// api-server/src/auth/auth.service.ts
signup(): IdentityData {
  const identity = createIdentity();
  this.semaphoreService.registerCommitment(identity.commitment);
  return identity;
}
```

## Importing an Identity

If you have a private key, you can restore the full identity:

```typescript
import { importIdentity } from 'zwt-access-lib';

const identity = importIdentity("trapdoor:nullifier");
```

This is how the frontend uses your saved identity from localStorage.

## Identity Lifecycle

### 1. Creation

```
User → Request Identity → Generate Random Values → Create Identity
```

### 2. Registration

```
Identity → Extract Commitment → Add to Group → Stored in Backend
```

### 3. Storage

**Frontend**: Saved to localStorage

```typescript
localStorage.setItem('zwt_identity', JSON.stringify(identity));
```

**Backend**: Commitment added to Set

```typescript
this.commitments.add(identity.commitment);
```

### 4. Usage

Used to generate proofs for accessing protected resources:

```typescript
const proof = await generateProof({
  identity: myIdentity,  // ← Your identity
  groupMembers: [...],
  signal: "...",
  externalNullifier: "..."
});
```

## Identity vs Traditional Auth

| Aspect | Traditional Auth | ZWT Identity |
|--------|-----------------|--------------|
| **Creation** | Server assigns username | Client/server generates random |
| **Storage** | Server database | Distributed (client + server) |
| **Authentication** | Username + password | Zero-knowledge proof |
| **Anonymity** | Server knows who you are | Server only knows you're a member |
| **Linkability** | All actions linked to username | Different proofs unlinkable |
| **Revocation** | Delete account | Remove commitment from group |

## Security Considerations

### ✅ Safe Practices

- **Keep private key secret** - never share it
- **Backup private key** - you can't recover it
- **One identity per user** - don't share identities
- **Secure storage** - encrypt localStorage in production

### ❌ Unsafe Practices

- **Don't log private keys** - they're secrets
- **Don't send over HTTP** - use HTTPS only
- **Don't store in cookies** - XSS vulnerable
- **Don't reuse across apps** - creates linkability

## Identity in Code

### Frontend Hook

```typescript
// packages/frontend/src/hooks/useIdentity.ts
export function useIdentity() {
  const [identity, setIdentity] = useState<IdentityData | null>(null);

  const saveIdentity = (identityData: IdentityData) => {
    localStorage.setItem('zwt_identity', JSON.stringify(identityData));
    setIdentity(identityData);
  };

  return { identity, saveIdentity, clearIdentity };
}
```

### Usage in Components

```typescript
const { identity, saveIdentity } = useIdentity();

const handleCreateIdentity = async () => {
  const response = await axios.post('/auth/signup');
  saveIdentity(response.data.identity);
};
```

## Advanced: Identity Mathematics

Identities use **Poseidon hashing** (ZK-friendly):

```typescript
commitment = poseidon([trapdoor, nullifier])
```

This creates a **hiding** commitment:
- Given commitment, you can't find trapdoor/nullifier
- Same trapdoor/nullifier always produces same commitment
- Different trapdoor/nullifier produces different commitment

## Next Steps

- [Zero-Knowledge Proofs](zero-knowledge-proofs) - How proofs work
- [Semaphore Protocol](semaphore-protocol) - The underlying system
- [Access Control](access-control) - Using identities for authentication
