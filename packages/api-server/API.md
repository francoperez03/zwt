# ZWT API Server Documentation

Base URL: `http://localhost:3000`

## Authentication

Protected endpoints require a Semaphore zero-knowledge proof sent via the `X-ZWT-TOKEN` header.

```
X-ZWT-TOKEN: {"proof": {...}, "nullifierHash": "...", "externalNullifier": "...", "signal": "..."}
```

---

## Endpoints

### 1. Signup - Create Identity

Creates a new anonymous Semaphore identity on the server.

**Endpoint:** `POST /auth/signup`

**Authentication:** None

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "identity": {
    "privateKey": "0x1234...",
    "publicKey": "0x5678...",
    "commitment": "12345678901234567890"
  }
}
```

**Response Fields:**
- `success` (boolean): Operation status
- `identity` (IdentityData): Complete identity data
  - `privateKey` (string): Private key (keep secret!)
  - `publicKey` (string): Public key
  - `commitment` (string): Identity commitment (registered in group)

**Example:**
```bash
curl -X POST http://localhost:3000/auth/signup
```

**Notes:**
- The commitment is automatically registered in the backend group
- Store the `privateKey` securely to generate proofs later
- This identity is needed to access protected resources

---

### 2. Get Group Members

Returns all registered identity commitments in the group.

**Endpoint:** `GET /auth/group-members`

**Authentication:** None

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:** None

**Response (200 OK):**
```json
{
  "success": true,
  "members": [
    "12345678901234567890",
    "09876543210987654321",
    "11111111111111111111"
  ]
}
```

**Response Fields:**
- `success` (boolean): Operation status
- `members` (string[]): Array of identity commitments

**Example:**
```bash
curl http://localhost:3000/auth/group-members
```

**Notes:**
- This list is needed by clients to build the Merkle tree for proof generation
- Each member is an identity commitment (public identifier)
- The frontend needs this to generate valid proofs

---

### 3. Get Protected Resource

Access protected content with a valid Semaphore proof.

**Endpoint:** `GET /protected/view`

**Authentication:** Required (Semaphore Proof)

**Request Headers:**
```
Content-Type: application/json
X-ZWT-TOKEN: <proof-json>
```

**X-ZWT-TOKEN Structure:**
```json
{
  "proof": {
    // Semaphore proof object (complex structure)
  },
  "nullifierHash": "1234567890...",
  "externalNullifier": "9876543210...",
  "signal": "5555555555..."
}
```

**Request Body:** None

**Response (200 OK):**
```json
{
  "message": "This is protected content",
  "timestamp": "2025-10-23T15:30:45.123Z",
  "data": "You have successfully accessed this resource with a valid Semaphore proof"
}
```

**Response Fields:**
- `message` (string): Success message
- `timestamp` (string): ISO timestamp of the request
- `data` (string): Protected content

**Error Response (401 Unauthorized):**
```json
{
  "statusCode": 401,
  "message": "Semaphore proof required"
}
```

**Error Response (403 Forbidden):**
```json
{
  "statusCode": 403,
  "message": "Invalid proof"
}
```

**Example:**
```bash
curl -X GET http://localhost:3000/protected/view \
  -H "Content-Type: application/json" \
  -H "X-ZWT-TOKEN: {\"proof\":{...},\"nullifierHash\":\"123...\",\"externalNullifier\":\"456...\",\"signal\":\"789...\"}"
```

**Notes:**
- The proof must be generated using your identity and the current group members
- Each proof contains a nullifier hash that prevents replay attacks
- Once a nullifier is used, it cannot be used again (prevents double-spending)
- The frontend generates proofs automatically via axios interceptor

---

## Type Definitions

### IdentityData
```typescript
interface IdentityData {
  privateKey: string;   // Secret key for generating proofs
  publicKey: string;    // Public key (not used in current implementation)
  commitment: string;   // Public identifier registered in group
}
```

### ProofResult
```typescript
interface ProofResult {
  proof: any;                    // Semaphore proof object
  nullifierHash: string;         // Unique hash preventing replay
  externalNullifier: string;     // Scope of the proof
  signal: string;                // Message/context being proven
}
```

### AccessContext
```typescript
interface AccessContext {
  signal: string;               // Hash of endpoint + scope
  externalNullifier: string;    // Hash of endpoint + epoch
  epoch: number;                // Current time window
}
```

---

## Error Codes

| Status Code | Message | Description |
|------------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created (signup) |
| 401 | Unauthorized | Missing or malformed proof |
| 403 | Forbidden | Invalid proof or nullifier already used |
| 500 | Internal Server Error | Server error |

---

## Authentication Flow

### Step 1: Create Identity (Signup)
```
POST /auth/signup
→ Returns { identity: { privateKey, publicKey, commitment } }
→ Store privateKey securely (localStorage)
```

### Step 2: Get Group Members
```
GET /auth/group-members
→ Returns { members: ["commitment1", "commitment2", ...] }
→ Frontend needs this to build Merkle tree
```

### Step 3: Generate Proof (Client-side)
```javascript
import { generateProof, buildAccessContext } from 'zwt-access-lib';

const { signal, externalNullifier } = buildAccessContext('/protected/view');

const proof = await generateProof({
  identity: savedIdentity,
  groupMembers: fetchedMembers,
  signal,
  externalNullifier
});
```

### Step 4: Access Protected Resource
```
GET /protected/view
Headers: { X-ZWT-TOKEN: JSON.stringify(proof) }
→ Backend verifies proof
→ Returns protected content
```

---

## Nullifier Management

### How It Works

1. Each proof generates a unique `nullifierHash` based on:
   - User's identity (secret)
   - External nullifier (scope)

2. The backend stores used nullifier hashes in memory

3. When a proof is verified:
   - Check if nullifier was already used → Reject if yes
   - Verify the proof cryptographically → Reject if invalid
   - Mark nullifier as used → Accept request

4. Same user can generate new proofs with different external nullifiers (e.g., different time epochs)

### Epoch-Based Access

The system uses epoch-based external nullifiers to allow N accesses per time period:

```typescript
// 1 access per hour (3600000 ms)
const epoch = Math.floor(Date.now() / 3600000);
const externalNullifier = hash(endpoint + epoch);
```

When the epoch changes (new hour), users can generate new proofs with different nullifiers.

---

## Storage

### In-Memory (Current Implementation)

The API server currently uses in-memory storage:

```typescript
private readonly commitments: Set<string> = new Set();
private readonly usedNullifiers: Set<string> = new Set();
```

**Limitations:**
- Data is lost on server restart
- Cannot scale horizontally (multiple instances)
- No persistence

**For Production:**
Replace with database (MongoDB, PostgreSQL, Redis) for:
- Persistent storage
- Multi-instance support
- Better query capabilities

---

## Example: Complete Flow

### 1. Create Identity
```bash
curl -X POST http://localhost:3000/auth/signup

# Response:
{
  "success": true,
  "identity": {
    "privateKey": "0xabc123...",
    "publicKey": "0xdef456...",
    "commitment": "1234567890123456789012345678901234567890"
  }
}
```

### 2. Get Group Members
```bash
curl http://localhost:3000/auth/group-members

# Response:
{
  "success": true,
  "members": [
    "1234567890123456789012345678901234567890"
  ]
}
```

### 3. Generate Proof (using library)
```javascript
// Client-side JavaScript
const identity = {
  privateKey: "0xabc123...",
  publicKey: "0xdef456...",
  commitment: "1234567890123456789012345678901234567890"
};

const members = ["1234567890123456789012345678901234567890"];

const { signal, externalNullifier } = buildAccessContext('/protected/view');

const proof = await generateProof({
  identity,
  groupMembers: members,
  signal,
  externalNullifier
});
```

### 4. Access Protected Resource
```bash
curl -X GET http://localhost:3000/protected/view \
  -H "Content-Type: application/json" \
  -H "X-ZWT-TOKEN: {\"proof\":{...},\"nullifierHash\":\"...\",\"externalNullifier\":\"...\",\"signal\":\"...\"}"

# Response:
{
  "message": "This is protected content",
  "timestamp": "2025-10-23T15:30:45.123Z",
  "data": "You have successfully accessed this resource with a valid Semaphore proof"
}
```

---

## Development Notes

### CORS

The server has CORS enabled for all origins (development mode):

```typescript
app.enableCors();
```

For production, restrict to specific origins.

### Port

Default port: `3000`

Can be changed in `src/main.ts`:
```typescript
await app.listen(3000);
```

### Logging

The server logs to console:
- Server startup: `Server running on http://localhost:3000`
- Proof verification failures are logged in `SemaphoreService`

---

## Security Considerations

### ⚠️ Important

1. **Never expose private keys**: The `privateKey` should never be sent to the server after signup
2. **Store private keys securely**: Use encrypted storage (not plain localStorage in production)
3. **HTTPS in production**: Always use HTTPS to prevent man-in-the-middle attacks
4. **Rate limiting**: Implement rate limiting to prevent abuse
5. **Nullifier storage**: Use persistent storage (database) in production
6. **Input validation**: Add request body validation for future endpoints

---

## Future Improvements

- [ ] Add database persistence (MongoDB/PostgreSQL)
- [ ] Implement rate limiting
- [ ] Add request body validation
- [ ] Add Swagger/OpenAPI documentation
- [ ] Implement refresh mechanism for group members
- [ ] Add admin endpoints for user management
- [ ] Implement multiple groups/roles
- [ ] Add metrics and monitoring
- [ ] Implement proof caching
- [ ] Add comprehensive error handling

---

Last Updated: 2025-10-23
