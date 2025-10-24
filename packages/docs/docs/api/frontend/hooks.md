---
sidebar_position: 1
---

# Hooks API

React hooks for identity and state management.

**Module**: `packages/frontend/src/hooks/`

## useIdentity

Custom hook for managing user identity with localStorage persistence.

**File**: `packages/frontend/src/hooks/useIdentity.ts`

### Usage

```typescript
import { useIdentity } from './hooks/useIdentity';

function MyComponent() {
  const { identity, saveIdentity, clearIdentity } = useIdentity();

  // identity is loaded from localStorage on mount
  if (!identity) {
    return <div>No identity</div>;
  }

  return <div>Commitment: {identity.commitment}</div>;
}
```

### Return Value

```typescript
{
  identity: IdentityData | null,
  saveIdentity: (identityData: IdentityData) => void,
  clearIdentity: () => void
}
```

### Properties

#### identity

```typescript
identity: IdentityData | null
```

Current identity state. `null` if no identity exists.

**Example**:
```typescript
const { identity } = useIdentity();

if (identity) {
  console.log('Private Key:', identity.privateKey);
  console.log('Commitment:', identity.commitment);
}
```

---

#### saveIdentity()

```typescript
saveIdentity(identityData: IdentityData): void
```

Saves identity to both state and localStorage.

**Parameters**:
- `identityData` ([`IdentityData`](../lib/types#identitydata)): Identity to save

**Example**:
```typescript
const { saveIdentity } = useIdentity();

const handleCreateIdentity = async () => {
  const response = await axios.post('/auth/signup');
  saveIdentity(response.data.identity);
};
```

**Storage**:
- Key: `'zwt_identity'`
- Format: JSON string of `IdentityData`

---

#### clearIdentity()

```typescript
clearIdentity(): void
```

Removes identity from both state and localStorage.

**Example**:
```typescript
const { clearIdentity } = useIdentity();

const handleLogout = () => {
  clearIdentity();
  // Identity is now null
};
```

### Implementation

**Source** (`useIdentity.ts:6-35`):
```typescript
export function useIdentity() {
  const [identity, setIdentity] = useState<IdentityData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(IDENTITY_KEY);
    if (stored) {
      try {
        setIdentity(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse identity from localStorage');
      }
    }
  }, []);

  const saveIdentity = (identityData: IdentityData) => {
    localStorage.setItem(IDENTITY_KEY, JSON.stringify(identityData));
    setIdentity(identityData);
  };

  const clearIdentity = () => {
    localStorage.removeItem(IDENTITY_KEY);
    setIdentity(null);
  };

  return {
    identity,
    saveIdentity,
    clearIdentity
  };
}
```

### Constants

```typescript
const IDENTITY_KEY = 'zwt_identity';
```

localStorage key for storing identity.

## Complete Example

```typescript
import React from 'react';
import { useIdentity } from './hooks/useIdentity';
import axios from 'axios';

function IdentityManager() {
  const { identity, saveIdentity, clearIdentity } = useIdentity();

  const createIdentity = async () => {
    const response = await axios.post('/auth/signup');
    saveIdentity(response.data.identity);
  };

  if (!identity) {
    return (
      <div>
        <p>No identity found</p>
        <button onClick={createIdentity}>
          Create Identity
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2>Your Identity</h2>
      <p>Commitment: {identity.commitment}</p>
      <button onClick={clearIdentity}>
        Clear Identity
      </button>
    </div>
  );
}
```

## Related

- [Components API](components) - UI components using this hook
- [Identity Concepts](../../concepts/identity)
- [Identity API](../lib/identity)
