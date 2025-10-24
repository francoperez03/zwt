---
sidebar_position: 1
---

# API Overview

Complete API reference for ZWT packages.

## Packages

ZWT consists of three packages:

### 1. zwt-access-lib (Shared Library)

Core cryptographic operations:
- **Identity Management**: Create and import identities
- **Proof Generation**: Generate zero-knowledge proofs
- **Proof Verification**: Verify proofs cryptographically
- **Context Building**: Create access contexts with epochs

[Library API Reference →](lib/identity)

### 2. api-server (Backend)

REST API endpoints:
- **Auth**: Identity creation and group management
- **Protected**: Protected resource endpoints
- **Semaphore**: Proof verification service

[Backend API Reference →](backend/auth)

### 3. frontend (UI)

React components and hooks:
- **Hooks**: Identity management and API interactions
- **Components**: UI for identity creation and protected access
- **API Client**: Axios instance with proof interceptor

[Frontend API Reference →](frontend/hooks)

## Quick Reference

### Library Functions

```typescript
// Identity
createIdentity(): IdentityData
importIdentity(privateKey: string): IdentityData

// Proof
generateProof(input: ProofInput): Promise<ProofResult>
verifyProof(proofResult: ProofResult): Promise<boolean>

// Context
buildAccessContext(endpoint: string, scope?: string, ttlMs?: number): AccessContext
```

### Backend Endpoints

```
POST   /auth/signup          - Create new identity
GET    /auth/group-members   - Get all group members
GET    /protected/view       - Access protected resource (requires proof)
```

### Frontend Hooks

```typescript
// Identity management
useIdentity(): { identity, saveIdentity, clearIdentity }
```

## Type Definitions

All type definitions are in [`packages/zwt-access-lib/src/types.ts`](lib/types).

## Next Steps

- [Library: Identity API](lib/identity)
- [Library: Proof API](lib/proof)
- [Backend: Auth API](backend/auth)
- [Frontend: Hooks API](frontend/hooks)
