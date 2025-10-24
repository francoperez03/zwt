---
sidebar_position: 1
---

# Auth API

Authentication endpoints for identity creation and group management.

**Module**: `packages/api-server/src/auth/`

## Endpoints

### POST /auth/signup

Creates a new cryptographic identity and registers it in the group.

**Request**:
```http
POST /auth/signup HTTP/1.1
Content-Type: application/json
```

**Response** (200 OK):
```json
{
  "success": true,
  "identity": {
    "privateKey": "12345678:87654321",
    "publicKey": "1122334455",
    "commitment": "9988776655"
  }
}
```

**Example (curl)**:
```bash
curl -X POST http://localhost:3000/auth/signup
```

**Example (JavaScript)**:
```typescript
const response = await axios.post('/auth/signup');
const identity = response.data.identity;

// Save identity
localStorage.setItem('identity', JSON.stringify(identity));
```

**Implementation** (`auth.controller.ts:8-15`):
```typescript
@Post('signup')
signup() {
  const identity = this.authService.signup();
  return {
    success: true,
    identity
  };
}
```

---

### GET /auth/group-members

Retrieves all registered group member commitments.

**Request**:
```http
GET /auth/group-members HTTP/1.1
```

**Response** (200 OK):
```json
{
  "success": true,
  "members": [
    "commitment1",
    "commitment2",
    "commitment3"
  ]
}
```

**Example (curl)**:
```bash
curl http://localhost:3000/auth/group-members
```

**Example (JavaScript)**:
```typescript
const response = await axios.get('/auth/group-members');
const groupMembers = response.data.members;

// Use for proof generation
const proof = await generateProof({
  identity: myIdentity,
  groupMembers: groupMembers,
  signal: context.signal,
  externalNullifier: context.externalNullifier
});
```

**Implementation** (`auth.controller.ts:17-24`):
```typescript
@Get('group-members')
getGroupMembers() {
  const members = this.authService.getGroupMembers();
  return {
    success: true,
    members
  };
}
```

## Service

### AuthService

**File**: `packages/api-server/src/auth/auth.service.ts`

#### signup()

```typescript
signup(): IdentityData
```

Creates identity and registers commitment:

1. Calls `createIdentity()` from zwt-access-lib
2. Registers commitment via `SemaphoreService`
3. Returns identity data

**Source**:
```typescript
signup(): IdentityData {
  const identity = createIdentity();
  this.semaphoreService.registerCommitment(identity.commitment);
  return identity;
}
```

#### getGroupMembers()

```typescript
getGroupMembers(): string[]
```

Returns all registered commitments from `SemaphoreService`.

**Source**:
```typescript
getGroupMembers(): string[] {
  return this.semaphoreService.getCommitments();
}
```

## Error Handling

Currently returns 200 OK for all requests. Production should handle:

- Server errors (500)
- Invalid input (400)
- Rate limiting (429)

## Related

- [Protected API](protected) - Protected endpoints
- [Semaphore Service](semaphore) - Proof verification
- [Identity API](../lib/identity) - Identity creation library
