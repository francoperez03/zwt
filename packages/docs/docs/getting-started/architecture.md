---
sidebar_position: 3
---

# Architecture

Understanding the ZWT system design and how components interact.

## System Overview

ZWT is built as a **monorepo** with three interconnected packages:

```
┌─────────────────────────────────────────────────┐
│                    ZWT Project                   │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────┐│
│  │   Frontend   │  │  API Server  │  │  Lib   ││
│  │  (React +    │──│   (NestJS)   │──│ (Core) ││
│  │    Vite)     │  │              │  │        ││
│  └──────────────┘  └──────────────┘  └────────┘│
│                                                  │
└─────────────────────────────────────────────────┘
```

## Package Architecture

### 1. zwt-access-lib (Shared Library)

**Location**: `packages/zwt-access-lib/`

**Purpose**: Core cryptographic operations shared by both frontend and backend.

**Key Modules**:

| Module | File | Description |
|--------|------|-------------|
| **Types** | `types.ts` | TypeScript interfaces for all data structures |
| **Identity** | `identity.ts` | Create and import Semaphore identities |
| **Proof** | `proof.ts` | Generate and verify zero-knowledge proofs |
| **Context** | `context.ts` | Build access contexts with epoch-based nullifiers |

**Dependencies**:
- `@semaphore-protocol/identity` - Identity management
- `@semaphore-protocol/group` - Merkle tree group management
- `@semaphore-protocol/proof` - ZK proof generation/verification
- `poseidon-lite` - ZK-friendly hashing

### 2. api-server (Backend)

**Location**: `packages/api-server/`

**Purpose**: REST API for identity registration, group management, and access control.

**Architecture**: NestJS modular structure

```
api-server/src/
├── main.ts                    # Application entry point
├── app.module.ts              # Root module
├── auth/                      # Authentication module
│   ├── auth.controller.ts     # POST /auth/signup, GET /auth/group-members
│   ├── auth.service.ts        # Business logic
│   └── auth.module.ts
├── semaphore/                 # Zero-knowledge module
│   ├── semaphore.service.ts   # Proof verification, nullifier tracking
│   ├── semaphore.guard.ts     # NestJS guard for route protection
│   └── semaphore.module.ts
└── protected/                 # Protected resources
    ├── protected.controller.ts # GET /protected/view
    ├── protected.service.ts
    └── protected.module.ts
```

**Key Features**:
- **Dependency Injection**: NestJS IoC container
- **Guards**: Automatic proof verification on protected routes
- **In-Memory Storage**: Sets for commitments and nullifiers

### 3. frontend (User Interface)

**Location**: `packages/frontend/`

**Purpose**: React-based UI for identity management and protected resource access.

**Architecture**: Component-based React with custom hooks

```
frontend/src/
├── main.tsx                       # React entry point
├── App.tsx                        # Main application component
├── apiClient.ts                   # Axios instance with interceptor
├── hooks/
│   └── useIdentity.ts             # Identity management hook
└── components/
    ├── Signup.tsx                 # Identity creation UI
    ├── ProtectedView.tsx          # Protected resource access UI
    ├── IdentityCard.tsx           # Display identity details
    ├── RequestResponseViewer.tsx  # HTTP visualization
    ├── StepIndicator.tsx          # Progress indicator
    └── ui/                        # Radix UI components
```

**Key Features**:
- **Automatic Proof Injection**: Axios interceptor adds proofs to requests
- **localStorage**: Persists identity in browser
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible components

## Data Flow Architecture

### Identity Creation Flow

```
┌─────────┐        ┌──────────┐       ┌────────────┐
│ User    │        │ Frontend │       │ Backend    │
└────┬────┘        └─────┬────┘       └─────┬──────┘
     │                   │                   │
     │ 1. Click Create   │                   │
     │──────────────────>│                   │
     │                   │ 2. POST /auth/    │
     │                   │     signup        │
     │                   │──────────────────>│
     │                   │                   │ 3. Generate
     │                   │                   │    Identity
     │                   │                   │    (Semaphore)
     │                   │                   │
     │                   │ 4. Return Identity│
     │                   │<──────────────────│
     │                   │                   │ 5. Register
     │                   │ 6. Save to        │    Commitment
     │                   │    localStorage   │
     │ 7. Display        │                   │
     │    Identity       │                   │
     │<──────────────────│                   │
```

### Protected Access Flow

```
┌─────────┐     ┌──────────┐     ┌────────────┐
│ Frontend│     │ Lib      │     │ Backend    │
└────┬────┘     └─────┬────┘     └─────┬──────┘
     │                │                 │
     │ 1. Fetch Group │                 │
     │    Members     │                 │
     │────────────────┼────────────────>│
     │                │                 │
     │<───────────────┼─────────────────│
     │                │                 │
     │ 2. Build       │                 │
     │    Merkle Tree │                 │
     │                │                 │
     │ 3. Generate    │                 │
     │    Proof       │                 │
     │───────────────>│                 │
     │                │                 │
     │<───────────────│                 │
     │                │                 │
     │ 4. GET /protected/view           │
     │    (X-ZWT-TOKEN header)          │
     │─────────────────────────────────>│
     │                │                 │
     │                │                 │ 5. Extract
     │                │                 │    Proof
     │                │                 │
     │                │                 │ 6. Verify
     │                │                 │    Proof
     │                │                 │
     │                │                 │ 7. Check
     │                │                 │    Nullifier
     │                │                 │
     │ 8. Protected Data                │
     │<─────────────────────────────────│
```

## Security Architecture

### Zero-Knowledge Proof System

**Semaphore Protocol** provides:

1. **Group Membership**: Prove you're in a group without revealing which member
2. **Nullifiers**: Prevent proof reuse via unique nullifier hashing
3. **Signals**: Bind proofs to specific actions/contexts
4. **External Nullifiers**: Create epoch-based access control

### Cryptographic Components

| Component | Purpose | Implementation |
|-----------|---------|----------------|
| **Identity** | User's secret | Trapdoor + Nullifier pair |
| **Commitment** | Public identity | Poseidon hash of identity |
| **Merkle Tree** | Group structure | Binary tree of commitments |
| **Proof** | ZK authentication | SNARK proof of membership |
| **Nullifier Hash** | Prevent replay | Hash of identity + external nullifier |
| **Signal** | Context binding | Hash of endpoint + scope |

### Access Control Flow

```
Request → Extract Proof → Verify Cryptographically → Check Nullifier → Grant/Deny Access
```

**Verification Steps**:
1. Parse `X-ZWT-TOKEN` header
2. Verify proof against Semaphore circuit
3. Check if nullifier hash was used before
4. If valid and unused, mark nullifier as used
5. Grant access to protected resource

## Storage Architecture

### Backend Storage

**In-Memory** (not persistent):
- `Set<string> commitments` - All registered group members
- `Set<string> usedNullifiers` - Prevents replay attacks

**Limitations**:
- Data lost on server restart
- Not suitable for production
- No audit trail

**Future**: Database persistence (MongoDB/PostgreSQL)

### Frontend Storage

**localStorage**:
- Key: `zwt_identity`
- Value: JSON string of `IdentityData`

```json
{
  "privateKey": "trapdoor:nullifier",
  "publicKey": "...",
  "commitment": "..."
}
```

## Technology Stack

### Backend Stack

```
NestJS 10.3
├── @nestjs/common        # Core framework
├── @nestjs/core          # DI container
├── @nestjs/platform-express  # HTTP adapter
└── zwt-access-lib        # Crypto operations
```

### Frontend Stack

```
React 18.2 + Vite 5
├── react-dom             # React rendering
├── axios                 # HTTP client
├── tailwindcss           # Styling
├── @radix-ui/*           # UI components
└── zwt-access-lib        # Crypto operations
```

### Shared Library Stack

```
TypeScript + Semaphore v4
├── @semaphore-protocol/identity
├── @semaphore-protocol/group
├── @semaphore-protocol/proof
└── poseidon-lite
```

## Deployment Architecture

### Development

```
localhost:3000 (Backend) ← → localhost:5173 (Frontend)
       ↓                            ↓
   NestJS Dev Server           Vite Dev Server
       ↓                            ↓
   Hot Reload                  Hot Module Reload
```

### Production Considerations

```
Frontend (Static) → CDN
Backend (API) → Load Balancer → Multiple Instances
Database → PostgreSQL/MongoDB (for persistence)
Cache → Redis (for nullifier checking)
```

## Scalability Considerations

Current limitations for production:

1. **Single Server**: In-memory storage doesn't scale horizontally
2. **No Caching**: Every request verifies proof (expensive)
3. **No Queue**: Blocking proof verification
4. **No Rate Limiting**: Vulnerable to DoS

Future improvements:

- Database for persistence
- Redis for distributed nullifier checking
- Proof caching with TTL
- Message queue for async processing
- Rate limiting per nullifier
- Horizontal scaling with load balancer

## Next Steps

- [Identity Concepts](../concepts/identity) - Learn about cryptographic identities
- [Semaphore Protocol](../concepts/semaphore-protocol) - Deep dive into ZK proofs
- [API Reference](../api/overview) - Explore the API
