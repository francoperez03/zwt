---
sidebar_position: 4
---

# Access Control

How ZWT uses zero-knowledge proofs for anonymous authentication and access control.

## Overview

Traditional access control:
```
User → Credentials → Server verifies → Grants access
```

ZWT access control:
```
User → ZK Proof → Server verifies → Grants access (anonymously!)
```

## Access Control Flow

### 1. Identity Registration

User creates and registers their commitment:

```
POST /auth/signup
→ Backend generates identity
→ Registers commitment in group
→ Returns identity to user
→ User saves to localStorage
```

### 2. Group Synchronization

User fetches all group members:

```
GET /auth/group-members
→ Backend returns all commitments
→ User builds local Merkle tree
```

### 3. Proof-Based Access

User accesses protected resource:

```
GET /protected/view
Header: X-ZWT-TOKEN = {...proof...}
→ Backend extracts proof
→ Backend verifies proof
→ Backend checks nullifier
→ Backend grants access
```

## Epoch-Based Access Control

### What is an Epoch?

An **epoch** is a time period that determines when new access is allowed:

```typescript
const epoch = Math.floor(Date.now() / ttlMs);
// ttlMs = 3600000 (1 hour)
```

Examples:
- **Hour 1** (0-59 mins): Epoch 0 → Nullifier A
- **Hour 2** (60-119 mins): Epoch 1 → Nullifier B
- **Hour 3** (120-179 mins): Epoch 2 → Nullifier C

### Why Epochs?

Without epochs:
- ❌ First access = Only access (nullifier reused forever)

With epochs:
- ✅ One access per epoch
- ✅ New epoch = New nullifier = New access possible
- ✅ Still prevents spam (rate limiting)

### Configuring Epochs

```typescript
buildAccessContext(
  endpoint,
  scope,
  ttlMs  // ← Time-to-live in milliseconds
)

// Examples:
ttlMs = 3600000    // 1 hour
ttlMs = 86400000   // 1 day
ttlMs = 60000      // 1 minute
ttlMs = 604800000  // 1 week
```

## Access Context

### What is an Access Context?

An **access context** binds a proof to:
- A specific resource (endpoint)
- A specific scope
- A specific time period (epoch)

### Building Access Context

```typescript
import { buildAccessContext } from 'zwt-access-lib';

const context = buildAccessContext(
  '/protected/view',  // endpoint
  'default',          // scope
  3600000             // ttl (1 hour)
);

// Returns:
// {
//   signal: "12345...",           // Hash of endpoint + scope
//   externalNullifier: "67890...", // Hash of endpoint + epoch
//   epoch: 12345                  // Current epoch number
// }
```

### Signal

Binds proof to specific resource:

```typescript
signal = poseidon([hash(endpoint), hash(scope)])
```

- Different endpoint → Different signal
- Different scope → Different signal

### External Nullifier

Prevents replay within epoch:

```typescript
externalNullifier = poseidon([hash(endpoint), epoch])
```

- Same endpoint + same epoch → Same external nullifier
- Different epoch → Different external nullifier

## Backend Verification

### Semaphore Guard

NestJS guard that protects routes:

```typescript
// packages/api-server/src/semaphore/semaphore.guard.ts
@Injectable()
export class SemaphoreGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Extract proof from header
    const proofHeader = request.headers['X-ZWT-TOKEN'];

    // 2. Parse JSON
    const proofObject = JSON.parse(proofHeader);

    // 3. Verify proof cryptographically
    const isValid = await this.semaphoreService.verifyProof(proofObject);

    // 4. Grant or deny access
    return isValid;
  }
}
```

### Applying the Guard

```typescript
// packages/api-server/src/protected/protected.controller.ts
@Controller('protected')
export class ProtectedController {
  @Get('view')
  @UseGuards(SemaphoreGuard)  // ← Applies proof verification
  getProtectedResource() {
    return { data: "Protected content!" };
  }
}
```

### Verification Process

```typescript
// packages/api-server/src/semaphore/semaphore.service.ts
async verifyProof(proofResult: ProofResult): Promise<boolean> {
  // 1. Check if nullifier was used before
  if (this.usedNullifiers.has(proofResult.nullifierHash)) {
    return false;  // Replay attack!
  }

  // 2. Verify proof cryptographically
  const isValid = await verifyProof(proofResult);

  // 3. If valid, mark nullifier as used
  if (isValid) {
    this.usedNullifiers.add(proofResult.nullifierHash);
  }

  return isValid;
}
```

## Frontend Integration

### Automatic Proof Injection

Axios interceptor adds proofs automatically:

```typescript
// packages/frontend/src/apiClient.ts
api.interceptors.request.use(async (config) => {
  // Only for protected routes
  if (config.url?.startsWith('/protected')) {
    // Build access context
    const { signal, externalNullifier } = buildAccessContext(
      config.url,
      'default',
      3600000
    );

    // Generate proof
    const proof = await generateProof({
      identity,
      groupMembers,
      signal,
      externalNullifier
    });

    // Add to header
    config.headers['X-ZWT-TOKEN'] = JSON.stringify(proof);
  }

  return config;
});
```

### Manual Proof Generation

```typescript
const proof = await generateProof({
  identity: myIdentity,
  groupMembers: allCommitments,
  signal: context.signal,
  externalNullifier: context.externalNullifier
});

// Use in request
axios.get('/protected/view', {
  headers: {
    'X-ZWT-TOKEN': JSON.stringify(proof)
  }
});
```

## Access Control Patterns

### Pattern 1: Protected Routes

```typescript
@Get('secret')
@UseGuards(SemaphoreGuard)
getSecret() {
  return { secret: "Only for group members!" };
}
```

### Pattern 2: Resource-Specific Access

```typescript
@Get('resource/:id')
@UseGuards(SemaphoreGuard)
getResource(@Param('id') id: string) {
  // Access context should include resource ID in signal
  return this.resourceService.get(id);
}
```

### Pattern 3: Action-Specific Access

```typescript
@Post('vote')
@UseGuards(SemaphoreGuard)
submitVote(@Body() vote: VoteDto) {
  // Nullifier prevents voting twice in same epoch
  return this.voteService.record(vote);
}
```

### Pattern 4: Multiple Groups

```typescript
@Get('admin')
@UseGuards(AdminSemaphoreGuard)  // Different group
getAdminPanel() {
  return { data: "Admin only!" };
}
```

## Access Control Policies

### Time-Based Access

```typescript
// Daily access
buildAccessContext(endpoint, 'daily', 86400000);

// Hourly access
buildAccessContext(endpoint, 'hourly', 3600000);

// Per-minute access (testing)
buildAccessContext(endpoint, 'minute', 60000);
```

### Scope-Based Access

```typescript
// Different scopes = different signals
buildAccessContext('/api/resource', 'read', ttl);
buildAccessContext('/api/resource', 'write', ttl);
buildAccessContext('/api/resource', 'delete', ttl);
```

### Resource-Based Access

```typescript
// Different resources = different signals
buildAccessContext('/api/resource/1', 'access', ttl);
buildAccessContext('/api/resource/2', 'access', ttl);
```

## Security Considerations

### ✅ What is Protected

- **Anonymity**: Server doesn't know which user accessed resource
- **Replay Prevention**: Same proof can't be used twice in epoch
- **Proof Validity**: Invalid proofs are rejected
- **Group Membership**: Only registered members can access

### ⚠️ What is NOT Protected

- **Sybil Attacks**: One user with multiple identities can access multiple times
- **Cross-Epoch Tracking**: Same user accessing across epochs (timing analysis)
- **Resource Enumeration**: Attacker can try accessing all resources
- **DoS Attacks**: Proof generation is expensive but unthrottled

### Mitigation Strategies

1. **Rate Limiting**: Limit requests per IP/fingerprint
2. **Proof Caching**: Cache valid proofs to reduce computation
3. **Resource Throttling**: Limit access to expensive resources
4. **Monitoring**: Track nullifier usage patterns
5. **Revocation**: Remove malicious commitments from group

## Advanced: Custom Verification Logic

### Adding Custom Checks

```typescript
@Injectable()
export class CustomSemaphoreGuard extends SemaphoreGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Standard verification
    const isValid = await super.canActivate(context);
    if (!isValid) return false;

    // 2. Custom logic
    const request = context.switchToHttp().getRequest();
    const nullifierHash = request.proofData.nullifierHash;

    // Check if this nullifier is rate-limited
    if (this.isRateLimited(nullifierHash)) {
      throw new TooManyRequestsException();
    }

    return true;
  }
}
```

### Resource-Specific Signals

```typescript
const resourceId = 'doc_123';
const context = buildAccessContext(
  `/protected/document/${resourceId}`,
  'read',
  3600000
);
```

Now proofs are bound to specific documents!

## Testing Access Control

### Test Valid Access

```bash
# 1. Create identity
curl -X POST http://localhost:3000/auth/signup

# 2. Generate proof (use frontend or script)

# 3. Access with proof
curl -H "X-ZWT-TOKEN: {...}" http://localhost:3000/protected/view
```

### Test Replay Attack

```bash
# Access twice with same proof
curl -H "X-ZWT-TOKEN: {...}" http://localhost:3000/protected/view
curl -H "X-ZWT-TOKEN: {...}" http://localhost:3000/protected/view
# Second request should fail
```

### Test Invalid Proof

```bash
curl -H "X-ZWT-TOKEN: invalid" http://localhost:3000/protected/view
# Should return 401 or 403
```

## Next Steps

- [Guides: Accessing Protected Resources](../guides/accessing-protected-resources)
- [API: Backend Semaphore Service](../api/backend/semaphore)
- [API: Semaphore Guard](../api/backend/semaphore)
