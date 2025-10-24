---
sidebar_position: 2
---

# Components API

React components for identity management and protected resource access.

**Module**: `packages/frontend/src/components/`

## Main Components

### Signup

Identity creation interface.

**File**: `packages/frontend/src/components/Signup.tsx`

**Features**:
- Create new identity via API
- Display identity details
- Show HTTP request/response
- Save to localStorage automatically

**Usage**:
```tsx
import Signup from './components/Signup';

function App() {
  return <Signup />;
}
```

**Key Functions**:
- `handleSignup()`: Creates identity via POST /auth/signup
- Uses `useIdentity()` hook for state management
- Shows `IdentityCard` component with identity details
- Shows `RequestResponseViewer` for HTTP visualization

---

### ProtectedView

Protected resource access interface.

**File**: `packages/frontend/src/components/ProtectedView.tsx`

**Features**:
- Load group members
- Generate zero-knowledge proof
- Access protected resource
- 4-step workflow visualization

**Usage**:
```tsx
import ProtectedView from './components/ProtectedView';

function App() {
  return <ProtectedView />;
}
```

**Workflow Steps**:
1. Load group members (GET /auth/group-members)
2. Generate proof (client-side)
3. Send request with proof (GET /protected/view)
4. Display protected content

**Key Functions**:
- `handleLoadMembers()`: Fetches group members
- `handleAccessProtected()`: Generates proof and accesses resource
- Uses axios interceptor for automatic proof injection

---

### IdentityCard

Displays identity details.

**File**: `packages/frontend/src/components/IdentityCard.tsx`

**Props**:
```typescript
interface IdentityCardProps {
  identity: IdentityData;
}
```

**Usage**:
```tsx
<IdentityCard identity={myIdentity} />
```

**Displays**:
- Private Key (with "Mostrar/Ocultar" toggle)
- Public Key
- Commitment

---

### RequestResponseViewer

HTTP request/response visualization.

**File**: `packages/frontend/src/components/RequestResponseViewer.tsx`

**Props**:
```typescript
interface RequestResponseViewerProps {
  request?: {
    method: string;
    url: string;
    headers?: any;
    body?: any;
  };
  response?: {
    status: number;
    data: any;
  };
}
```

**Usage**:
```tsx
<RequestResponseViewer
  request={{
    method: 'POST',
    url: '/auth/signup',
    headers: { 'Content-Type': 'application/json' }
  }}
  response={{
    status: 200,
    data: { success: true, identity: {...} }
  }}
/>
```

**Features**:
- Syntax-highlighted JSON
- Collapsible sections
- Status code badges

---

### StepIndicator

Visual progress indicator for multi-step workflows.

**File**: `packages/frontend/src/components/StepIndicator.tsx`

**Props**:
```typescript
interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}
```

**Usage**:
```tsx
<StepIndicator
  currentStep={2}
  steps={[
    'Cargar Miembros',
    'Generar Prueba',
    'Enviar Solicitud',
    'Éxito'
  ]}
/>
```

**Features**:
- Visual step progression
- Checkmarks for completed steps
- Highlights current step

## UI Components

Located in `packages/frontend/src/components/ui/`

**Radix UI wrappers**:
- `Button`: Styled button component
- `Card`: Card layout components (Card, CardHeader, CardTitle, CardContent)
- `Tabs`: Tab navigation (Tabs, TabsList, TabsTrigger, TabsContent)
- `Badge`: Status badges
- `Accordion`: Collapsible sections

**Usage**:
```tsx
import { Button } from './components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>

<Button onClick={handleClick}>
  Click Me
</Button>
```

## Complete Example

```tsx
import React from 'react';
import { useIdentity } from './hooks/useIdentity';
import Signup from './components/Signup';
import ProtectedView from './components/ProtectedView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';

function App() {
  const { identity } = useIdentity();

  return (
    <div className="container">
      <h1>ZWT Demo</h1>
      
      <Tabs defaultValue="signup">
        <TabsList>
          <TabsTrigger value="signup">
            Crear Identidad
          </TabsTrigger>
          <TabsTrigger value="protected">
            Ver Contenido Protegido
          </TabsTrigger>
        </TabsList>

        <TabsContent value="signup">
          <Signup />
        </TabsContent>

        <TabsContent value="protected">
          <ProtectedView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

## Related

- [Hooks API](hooks) - State management
- [API Client](api-client) - HTTP requests with proof injection
