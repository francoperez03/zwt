# ZWT - Zero-Knowledge Token

Anonymous access control proof-of-concept using Semaphore Protocol.

## Monorepo Structure

```
zwt/
    packages/
      zwt-access-lib/    # Shared library with Semaphore primitives
      api-server/              # NestJS backend with proof verification
      frontend/                # React frontend with proof generation
    PRPs/                        # Project Research Proposals
      research/                    # Project research and documentation
      PROJECT_OVERVIEW.md          # Complete project context
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This installs all dependencies for all packages in the monorepo.

### 2. Build Shared Library

```bash
npm run build --workspace=zwt-access-lib
```

The shared library must be built first before other packages can use it.

### 3. Run Backend

```bash
npm run dev:api
```

Backend runs on http://localhost:3000

### 4. Run Frontend

In a new terminal:

```bash
npm run dev:frontend
```

Frontend runs on http://localhost:5173

## Usage Flow

1. **Signup**: Create a new anonymous identity
   - Click "Create Identity" button
   - Identity is stored in localStorage
   - Commitment is registered in backend group

2. **Access Protected Resource**:
   - Switch to "Protected View" tab
   - Click "Fetch Protected Data"
   - Proof is generated automatically (~1 second)
   - Backend verifies proof
   - Protected content is displayed

## Development

### Build All Packages

```bash
npm run build
```

### Package Scripts

**Shared Library:**
```bash
cd packages/zwt-access-lib
npm run build        # Build library
npm run dev          # Build in watch mode
```

**Backend:**
```bash
cd packages/api-server
npm run dev          # Start with hot reload
npm run build        # Production build
npm run test         # Run tests
npm run test:e2e     # E2E tests
```

**Frontend:**
```bash
cd packages/frontend
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
```

## Architecture

### Shared Library (`zwt-access-lib`)

Provides primitives for Semaphore operations:

- `createIdentity()` - Create new identity
- `generateProof()` - Generate ZK proof
- `verifyProof()` - Verify ZK proof
- `buildAccessContext()` - Build signal/externalNullifier with epochs

### Backend (`api-server`)

NestJS application with:

- **SemaphoreGuard**: Extracts and verifies proofs from headers
- **SemaphoreService**: Manages commitments and nullifiers
- **AuthController**: POST /auth/signup, GET /auth/group-members
- **ProtectedController**: GET /protected/view (requires proof)

### Frontend (`frontend`)

React + Vite application with:

- **Signup Component**: Create identity via backend
- **ProtectedView Component**: Fetch protected data with auto-generated proof
- **useIdentity Hook**: Manage identity in localStorage
- **setupSemaphoreInterceptor**: Axios interceptor that auto-generates proofs

## Key Concepts

### Identity
Cryptographic credential. Only the commitment is public and shared with the backend.

### Group
Collection of identity commitments. Forms a Merkle tree with a unique root.

### Proof
Zero-knowledge proof that demonstrates group membership without revealing which member.

### Nullifier Hash
Unique hash per (identity + externalNullifier) that prevents replay attacks.

### External Nullifier
Defines the scope of uniqueness. Epoch-based nullifiers enable N accesses per time period.

## Project Research System

This project uses a PRP (Project Research Proposal) system for complex features.

See:
- [GUIA_RAPIDA_PRP.md](GUIA_RAPIDA_PRP.md) - Quick guide
- [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - Complete project context
- [research/](research/) - All project research

## Documentation

- **PROJECT_OVERVIEW.md** - Complete architectural overview
- **research/architecture/** - Architecture decisions
- **research/patterns/** - Implementation patterns (guards, interceptors)
- **research/libraries/semaphore/** - Semaphore Protocol docs

## Technologies

- **Semaphore Protocol v4** - Zero-knowledge proofs
- **NestJS** - Backend framework
- **React + Vite** - Frontend
- **TypeScript** - Type safety across all packages
- **npm workspaces** - Monorepo management

## License

MIT
