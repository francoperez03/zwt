---
sidebar_position: 1
---

# Installation

Get started with ZWT in just a few steps.

## Prerequisites

- **Node.js** >= 20.0
- **npm** >= 10.0
- **Git**

## Quick Install

```bash
# Clone the repository
git clone https://github.com/francoperez03/zwt.git
cd zwt

# Install dependencies
npm install

# Build the shared library
npm run build:lib
```

## Next Steps

- [Quick Start Guide](quick-start) - Run your first example
- [Architecture Overview](architecture) - Understand the system

## Available Commands

```bash
npm run build          # Build all packages
npm run dev:api        # Start backend (port 3000)
npm run dev:frontend   # Start frontend (port 5173)
npm run dev:lib        # Watch mode for library
npm run clean          # Clean build artifacts
```
