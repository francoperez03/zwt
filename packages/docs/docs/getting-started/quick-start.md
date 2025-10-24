---
sidebar_position: 2
---

# Quick Start

Learn how to run ZWT and perform your first anonymous authentication in minutes.

## Step 1: Start the Backend

```bash
npm run dev:api
```

Backend runs on **http://localhost:3000**

## Step 2: Start the Frontend

```bash
npm run dev:frontend
```

Frontend runs on **http://localhost:5173**

## Step 3: Create Your Identity

1. Open **http://localhost:5173**
2. Go to **"Crear Identidad"** tab
3. Click **"Crear Nueva Identidad"**
4. Your identity is created and saved

## Step 4: Access Protected Content

1. Go to **"Ver Contenido Protegido"** tab
2. Click **"Cargar Miembros del Grupo"**
3. Click **"Acceder a Contenido Protegido"**

✅ You just accessed protected content **anonymously**!

## What Happened?

- Zero-knowledge proof was generated automatically
- Backend verified you're a group member
- Server **never learned your identity**

## Next Steps

- [Architecture](architecture) - How it works
- [Core Concepts](../concepts/identity) - Understanding identities and proofs
- [API Reference](../api/overview) - Explore the API
