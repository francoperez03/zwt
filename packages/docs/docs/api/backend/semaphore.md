---
sidebar_position: 3
---

# Semaphore API

Proof verification and nullifier tracking.

**Module**: `packages/api-server/src/semaphore/`

## Service

### SemaphoreService

**File**: `packages/api-server/src/semaphore/semaphore.service.ts`

Manages group commitments and verifies proofs.

#### registerCommitment()

Adds a commitment to the group.

```typescript
registerCommitment(commitment: string): void
```

**Parameters**:
- `commitment` (string): Identity commitment to register

**Example**:
```typescript
this.semaphoreService.registerCommitment("12345678901234567890");
```

**Source** (`semaphore.service.ts:9-11`):
```typescript
registerCommitment(commitment: string): void {
  this.commitments.add(commitment);
}
```

---

#### getCommitments()

Returns all registered commitments.

```typescript
getCommitments(): string[]
```

**Returns**: Array of commitment strings

**Example**:
```typescript
const members = this.semaphoreService.getCommitments();
// ["commitment1", "commitment2", "commitment3"]
```

**Source** (`semaphore.service.ts:13-15`):
```typescript
getCommitments(): string[] {
  return Array.from(this.commitments);
}
```

---

#### verifyProof()

Verifies a proof and tracks nullifier.

```typescript
async verifyProof(proofResult: ProofResult): Promise<boolean>
```

**Parameters**:
- `proofResult` ([`ProofResult`](../lib/types#proofresult)): Proof to verify

**Returns**: `Promise<boolean>` - `true` if valid and unused, `false` otherwise

**Verification Steps**:
1. Check if nullifier was used before (replay prevention)
2. Verify proof cryptographically
3. If valid, mark nullifier as used
4. Return result

**Example**:
```typescript
const isValid = await this.semaphoreService.verifyProof(proofResult);

if (isValid) {
  // Grant access
} else {
  // Deny access (invalid or replay)
}
```

**Source** (`semaphore.service.ts:17-29`):
```typescript
async verifyProof(proofResult: ProofResult): Promise<boolean> {
  // Check replay
  if (this.usedNullifiers.has(proofResult.nullifierHash)) {
    return false;
  }

  // Verify cryptographically
  const isValid = await verifyProof(proofResult);

  // Mark as used
  if (isValid) {
    this.usedNullifiers.add(proofResult.nullifierHash);
  }

  return isValid;
}
```

## Guard

### SemaphoreGuard

**File**: `packages/api-server/src/semaphore/semaphore.guard.ts`

NestJS guard for automatic proof verification on protected routes.

#### canActivate()

```typescript
async canActivate(context: ExecutionContext): Promise<boolean>
```

**Process**:
1. Extract `X-ZWT-TOKEN` header from request
2. Parse JSON proof
3. Verify proof via `SemaphoreService`
4. Throw exception if invalid
5. Return `true` if valid

**Exceptions**:
- `UnauthorizedException`: No proof provided or invalid format
- `ForbiddenException`: Invalid or reused proof

**Source** (`semaphore.guard.ts:8-30`):
```typescript
async canActivate(context: ExecutionContext): Promise<boolean> {
  const request = context.switchToHttp().getRequest();
  const proofHeader = request.headers['X-ZWT-TOKEN'];

  if (!proofHeader) {
    throw new UnauthorizedException('Semaphore proof required');
  }

  let proofObject;
  try {
    proofObject = JSON.parse(proofHeader);
  } catch {
    throw new UnauthorizedException('Invalid proof format');
  }

  const isValid = await this.semaphoreService.verifyProof(proofObject);

  if (!isValid) {
    throw new ForbiddenException('Invalid proof');
  }

  return true;
}
```

#### Usage

Apply to controllers or methods:

```typescript
@Controller('protected')
export class ProtectedController {
  @Get('view')
  @UseGuards(SemaphoreGuard)  // ← Apply guard
  getProtectedResource() {
    return { data: "Protected!" };
  }
}
```

## Storage

### In-Memory Storage

```typescript
private readonly commitments: Set<string> = new Set();
private readonly usedNullifiers: Set<string> = new Set();
```

**Limitations**:
- Data lost on restart
- Not scalable horizontally
- No persistence

**Production Alternative**:
```typescript
// Use database
@InjectRepository(Commitment)
private commitmentRepo: Repository<Commitment>;

@InjectRepository(UsedNullifier)
private nullifierRepo: Repository<UsedNullifier>;
```

## Related

- [Protected API](protected) - Using the guard
- [Auth API](auth) - Registering commitments
- [Proof Verification](../lib/proof#verifyproof) - Cryptographic verification
