---
sidebar_position: 2
---

# Protected API

Protected endpoints requiring zero-knowledge proofs.

**Module**: `packages/api-server/src/protected/`

## Endpoints

### GET /protected/view

Access protected resource using zero-knowledge proof.

**Request**:
```http
GET /protected/view HTTP/1.1
X-ZWT-TOKEN: {"proof":{...},"nullifierHash":"...","externalNullifier":"...","signal":"..."}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Acceso autorizado mediante prueba de conocimiento cero",
  "data": {
    "content": "Este es contenido protegido que solo los miembros del grupo pueden ver."
  },
  "timestamp": "2025-10-24T05:00:00.000Z"
}
```

**Response** (401 Unauthorized):
```json
{
  "statusCode": 401,
  "message": "Semaphore proof required"
}
```

**Response** (403 Forbidden):
```json
{
  "statusCode": 403,
  "message": "Invalid proof"
}
```

**Example (curl)**:
```bash
curl -H "X-ZWT-TOKEN: {...proof...}" \
     http://localhost:3000/protected/view
```

**Example (JavaScript with axios interceptor)**:
```typescript
// Interceptor automatically adds proof
const response = await api.get('/protected/view');
console.log(response.data);
```

**Example (JavaScript manual)**:
```typescript
import { generateProof, buildAccessContext } from 'zwt-access-lib';

const context = buildAccessContext('/protected/view');

const proof = await generateProof({
  identity: myIdentity,
  groupMembers: allMembers,
  signal: context.signal,
  externalNullifier: context.externalNullifier
});

const response = await axios.get('/protected/view', {
  headers: {
    'X-ZWT-TOKEN': JSON.stringify(proof)
  }
});
```

**Implementation** (`protected.controller.ts:9-14`):
```typescript
@Get('view')
@UseGuards(SemaphoreGuard)  // ← Verifies proof
getProtectedResource() {
  return this.protectedService.getProtectedData();
}
```

## Service

### ProtectedService

**File**: `packages/api-server/src/protected/protected.service.ts`

#### getProtectedData()

```typescript
getProtectedData(): object
```

Returns mock protected data.

**Source**:
```typescript
getProtectedData() {
  return {
    success: true,
    message: 'Acceso autorizado mediante prueba de conocimiento cero',
    data: {
      content: 'Este es contenido protegido...'
    },
    timestamp: new Date().toISOString()
  };
}
```

## Guard Protection

All protected endpoints use `@UseGuards(SemaphoreGuard)`:

```typescript
@Controller('protected')
export class ProtectedController {
  @Get('view')
  @UseGuards(SemaphoreGuard)  // ← Automatic proof verification
  getProtectedResource() {
    return this.protectedService.getProtectedData();
  }
}
```

See [Semaphore API](semaphore) for guard details.

## Adding New Protected Endpoints

```typescript
@Get('another-resource')
@UseGuards(SemaphoreGuard)
getAnotherResource() {
  return { data: "Also protected!" };
}

@Post('submit')
@UseGuards(SemaphoreGuard)
submitData(@Body() data: any) {
  // Process submission
  return { success: true };
}
```

## Related

- [Semaphore Guard](semaphore) - Proof verification
- [Auth API](auth) - Identity creation
- [Proof API](../lib/proof) - Generating proofs
