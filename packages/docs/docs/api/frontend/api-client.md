---
sidebar_position: 3
---

# API Client

Axios instance with automatic proof injection.

**File**: `packages/frontend/src/apiClient.ts`

## setupSemaphoreInterceptor()

Creates an axios instance that automatically generates and injects proofs for protected routes.

### Signature

```typescript
function setupSemaphoreInterceptor(options: SetupOptions): AxiosInstance
```

### Parameters

```typescript
interface SetupOptions {
  identity: IdentityData;
  groupMembers: string[];
}
```

- `identity` ([`IdentityData`](../lib/types#identitydata)): Your cryptographic identity
- `groupMembers` (string[]): Array of all group member commitments

### Returns

`AxiosInstance` - Configured axios instance

### Usage

```typescript
import { setupSemaphoreInterceptor } from './apiClient';

const api = setupSemaphoreInterceptor({
  identity: myIdentity,
  groupMembers: allMembers
});

// Proof automatically added!
const response = await api.get('/protected/view');
```

### How It Works

1. Creates axios instance with base configuration
2. Adds request interceptor
3. Interceptor checks if URL starts with `/protected`
4. If yes, builds access context
5. Generates zero-knowledge proof
6. Injects proof into `X-ZWT-TOKEN` header
7. Sends request with proof

### Implementation

**Source** (`apiClient.ts:9-49`):
```typescript
export function setupSemaphoreInterceptor(options: SetupOptions): AxiosInstance {
  const { identity, groupMembers } = options;

  const api = axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  api.interceptors.request.use(
    async (config) => {
      if (config.url?.startsWith('/protected')) {
        try {
          const { signal, externalNullifier } = buildAccessContext(
            config.url,
            'default',
            3600000
          );

          const proof = await generateProof({
            identity,
            groupMembers,
            signal,
            externalNullifier
          });

          config.headers['X-ZWT-TOKEN'] = JSON.stringify(proof);
        } catch (error) {
          console.error('Failed to generate proof:', error);
          throw error;
        }
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  return api;
}
```

## Request Interceptor Details

### Interceptor Logic

```typescript
api.interceptors.request.use(async (config) => {
  // Only for protected routes
  if (config.url?.startsWith('/protected')) {
    // Build context
    const { signal, externalNullifier } = buildAccessContext(
      config.url,
      'default',
      3600000  // 1 hour
    );

    // Generate proof
    const proof = await generateProof({
      identity,
      groupMembers,
      signal,
      externalNullifier
    });

    // Inject into header
    config.headers['X-ZWT-TOKEN'] = JSON.stringify(proof);
  }

  return config;
});
```

### Protected Route Detection

Routes starting with `/protected` trigger proof generation:

```typescript
// These trigger proof generation
api.get('/protected/view')          // ✓
api.post('/protected/submit')       // ✓
api.get('/protected/resource/123')  // ✓

// These don't
api.get('/auth/signup')             // ✗
api.get('/auth/group-members')      // ✗
api.get('/public/data')             // ✗
```

### Error Handling

```typescript
try {
  const proof = await generateProof({...});
  config.headers['X-ZWT-TOKEN'] = JSON.stringify(proof);
} catch (error) {
  console.error('Failed to generate proof:', error);
  throw error;  // Request fails if proof generation fails
}
```

## Usage Examples

### Basic Usage

```typescript
import { setupSemaphoreInterceptor } from './apiClient';

// Setup once
const api = setupSemaphoreInterceptor({
  identity: myIdentity,
  groupMembers: allMembers
});

// Use multiple times
const response1 = await api.get('/protected/view');
const response2 = await api.post('/protected/submit', { data: 'value' });
```

### With React

```typescript
import { useState, useEffect } from 'react';
import { setupSemaphoreInterceptor } from './apiClient';
import { useIdentity } from './hooks/useIdentity';

function ProtectedView() {
  const { identity } = useIdentity();
  const [api, setApi] = useState(null);

  useEffect(() => {
    if (identity && groupMembers) {
      const apiInstance = setupSemaphoreInterceptor({
        identity,
        groupMembers
      });
      setApi(apiInstance);
    }
  }, [identity, groupMembers]);

  const handleAccess = async () => {
    if (api) {
      const response = await api.get('/protected/view');
      console.log(response.data);
    }
  };

  return <button onClick={handleAccess}>Access</button>;
}
```

### Manual Proof (Without Interceptor)

If you don't want automatic proof injection:

```typescript
import axios from 'axios';
import { generateProof, buildAccessContext } from 'zwt-access-lib';

const context = buildAccessContext('/protected/view');

const proof = await generateProof({
  identity: myIdentity,
  groupMembers: allMembers,
  signal: context.signal,
  externalNullifier: context.externalNullifier
});

const response = await axios.get('http://localhost:3000/protected/view', {
  headers: {
    'X-ZWT-TOKEN': JSON.stringify(proof)
  }
});
```

## Configuration

### Base URL

Default: `http://localhost:3000`

Change via environment variable:
```typescript
baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000'
```

### Epoch TTL

Default: 1 hour (`3600000`ms)

Customize:
```typescript
buildAccessContext(config.url, 'default', 600000)  // 10 minutes
```

## Performance Considerations

- Proof generation takes 1-5 seconds
- Blocks the request until proof is generated
- Consider showing loading indicator
- Cache the api instance, don't recreate on every request

## Related

- [Proof API](../lib/proof) - Proof generation
- [Context API](../lib/context) - Building access contexts
- [Protected API](../backend/protected) - Backend verification
