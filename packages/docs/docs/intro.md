---
sidebar_position: 1
---

# Introduction to ZWT

**ZWT (Zero-Knowledge Token)** is a proof-of-concept implementation for **anonymous access control** using the **Semaphore Protocol v4**. It demonstrates how zero-knowledge proofs can be used to authenticate users without revealing their identity.

## What is ZWT?

ZWT allows users to prove they are members of a group and access protected resources **without disclosing which specific member they are**. This is achieved through zero-knowledge cryptography, specifically using the Semaphore Protocol.

## Key Features

### 🔐 Anonymous Authentication
- Users can access protected resources without revealing their identity
- The server only knows that a valid group member made the request
- No personally identifiable information is transmitted

### 🛡️ Cryptographic Security
- Built on the **Semaphore Protocol v4**, a production-grade zero-knowledge proof system
- Uses **Poseidon hashing**, optimized for zero-knowledge circuits
- Implements **nullifier hashing** to prevent replay attacks

### ⏱️ Epoch-Based Access Control
- Access is time-limited using configurable epochs (default: 1 hour)
- Prevents unlimited access while maintaining anonymity
- New epoch allows new proof generation

### 🚀 Developer-Friendly
- **TypeScript** throughout the entire stack
- **Monorepo** architecture with npm workspaces
- **Modular** design with shared cryptographic library
- **Well-documented** API and components

## Architecture Overview

ZWT is organized as a monorepo with three main packages:

```
zwt/
├── packages/
│   ├── zwt-access-lib/      # Shared cryptographic library
│   ├── api-server/           # NestJS backend API
│   └── frontend/             # React + Vite frontend
```

### **zwt-access-lib** (Shared Library)
Core cryptographic operations including:
- Identity creation and management
- Zero-knowledge proof generation and verification
- Access context building with epoch-based nullifiers

### **api-server** (Backend)
NestJS-based REST API providing:
- Identity registration endpoints
- Group membership management
- Proof verification and access control
- Protected resource endpoints

### **frontend** (User Interface)
React application featuring:
- Identity creation interface
- Automatic proof generation via Axios interceptors
- Protected resource access demonstration
- Real-time request/response visualization

## How It Works

The authentication flow in ZWT follows these steps:

1. **User Creates Identity**: Frontend requests a new cryptographic identity from backend
2. **Identity Registration**: Backend generates identity and registers commitment in the group
3. **Identity Storage**: Frontend saves identity to browser localStorage
4. **Group Synchronization**: Frontend fetches all group members to build local Merkle tree
5. **Proof Generation**: When accessing protected resources, client generates ZK proof
6. **Proof Transmission**: Proof sent to backend via `X-ZWT-TOKEN` header
7. **Proof Verification**: Backend verifies proof cryptographically and checks nullifier
8. **Access Granted**: If valid, backend returns protected resource

## Use Cases

ZWT is ideal for scenarios requiring anonymous yet authenticated access:

- **Anonymous Voting**: Allow eligible voters to cast ballots without revealing their identity
- **Whistleblower Systems**: Enable verified employees to report issues anonymously
- **Privacy-Preserving Forums**: Let verified members post without linking posts to identities
- **Anonymous Surveys**: Ensure only authorized participants respond while maintaining anonymity
- **Credential-Free Access**: Grant access based on group membership rather than individual credentials

## Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Language** | TypeScript | Type-safe development across all packages |
| **Backend Framework** | NestJS 10.3 | Modular, scalable server architecture |
| **Frontend Framework** | React 18.2 + Vite 5 | Fast, modern UI development |
| **Styling** | Tailwind CSS 3.4 | Utility-first responsive design |
| **UI Components** | Radix UI | Accessible, unstyled component primitives |
| **ZK Protocol** | Semaphore v4.0.3 | Production-grade zero-knowledge proofs |
| **Hashing** | Poseidon (via poseidon-lite) | ZK-friendly cryptographic hashing |
| **Monorepo** | npm workspaces | Shared dependencies and build coordination |

## Current Limitations

As a proof-of-concept, ZWT has some limitations:

- **In-Memory Storage**: Data is not persisted (lost on server restart)
- **No Database**: Commitments and nullifiers stored in memory Sets
- **Not Production-Ready**: Lacks production-grade error handling, monitoring, and scaling
- **Single Server**: Not designed for horizontal scaling
- **Basic UI**: Focused on demonstration rather than production UX

## Next Steps

Ready to get started? Check out these guides:

- [Installation Guide](getting-started/installation) - Set up the ZWT monorepo
- [Quick Start](getting-started/quick-start) - Run your first anonymous authentication
- [Architecture Deep Dive](getting-started/architecture) - Understand the system design
- [Core Concepts](concepts/identity) - Learn about identities, proofs, and the Semaphore protocol
