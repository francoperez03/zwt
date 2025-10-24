---
sidebar_position: 1
---

# Creating an Identity

Step-by-step guide for creating and managing cryptographic identities.

## Using the Frontend

### Step 1: Open the Application

Navigate to `http://localhost:5173` in your browser.

### Step 2: Go to "Crear Identidad" Tab

Click on the first tab labeled **"Crear Identidad"**.

### Step 3: Click "Crear Nueva Identidad"

Click the blue button to generate a new identity.

### Step 4: Identity Created!

You'll see three values:
- **Private Key**: Keep this secret!
- **Public Key**: Your public identifier
- **Commitment**: Your group membership proof

The identity is automatically saved to localStorage.

## Using the API Directly

### Create Identity via API

```bash
curl -X POST http://localhost:3000/auth/signup
```

Response:

```json
{
  "success": true,
  "identity": {
    "privateKey": "12345:67890",
    "publicKey": "11223344",
    "commitment": "99887766"
  }
}
```

### Save the Identity

Store the identity securely (e.g., localStorage, encrypted database).

## Using the Library Programmatically

```typescript
import { createIdentity } from 'zwt-access-lib';

const identity = createIdentity();

console.log(identity);
// {
//   privateKey: "...:...",
//   publicKey: "...",
//   commitment: "..."
// }

// Save to storage
localStorage.setItem('my_identity', JSON.stringify(identity));
```

## Importing an Existing Identity

```typescript
import { importIdentity } from 'zwt-access-lib';

const privateKey = "12345:67890";
const identity = importIdentity(privateKey);

console.log(identity.commitment);
```

## Best Practices

✅ **Keep private keys secure**
✅ **Backup your private key**
✅ **One identity per user**
✅ **Use HTTPS in production**

❌ **Never log private keys**
❌ **Don't share identities**
❌ **Don't hardcode private keys**

## Next Steps

- [Accessing Protected Resources](accessing-protected-resources)
- [Backend Integration](backend-integration)
