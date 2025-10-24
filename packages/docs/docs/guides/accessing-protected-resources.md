---
sidebar_position: 2
---

# Accessing Protected Resources

Learn how to access protected endpoints using zero-knowledge proofs.

## Using the Frontend

### 1. Create or Load Identity

Ensure you have an identity (see [Creating an Identity](creating-identity)).

### 2. Switch to "Ver Contenido Protegido" Tab

Click the second tab.

### 3. Load Group Members

Click **"Cargar Miembros del Grupo"** to fetch all registered commitments.

### 4. Access Protected Content

Click **"Acceder a Contenido Protegido"** to generate proof and access the resource.

The UI will show you the HTTP request/response details!

## Using the API

### 1. Get Group Members

```bash
curl http://localhost:3000/auth/group-members
```

### 2. Generate Proof

```typescript
import { generateProof, buildAccessContext } from 'zwt-access-lib';

const context = buildAccessContext('/protected/view', 'default', 3600000);

const proof = await generateProof({
  identity: myIdentity,
  groupMembers: members,
  signal: context.signal,
  externalNullifier: context.externalNullifier
});
```

### 3. Access Protected Resource

```bash
curl -H "X-ZWT-TOKEN: {\"proof\":...}" http://localhost:3000/protected/view
```

## Using Axios Interceptor

```typescript
import { setupSemaphoreInterceptor } from './apiClient';

const api = setupSemaphoreInterceptor({
  identity: myIdentity,
  groupMembers: members
});

// Proof automatically added!
const response = await api.get('/protected/view');
```

## Handling Errors

### Nullifier Already Used

```
Error: Invalid proof
```

**Solution**: Wait for next epoch or use different identity.

### Identity Not in Group

```
Error: Proof generation failed
```

**Solution**: Ensure your commitment is in the group members array.

## Next Steps

- [Backend Integration](backend-integration)
- [API Reference](../api/overview)
