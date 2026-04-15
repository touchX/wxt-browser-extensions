# Quickstart: Pnpm Monorepo with Server, Browser Extension and Web Client

**Feature**: 002-pnpm-monorepo-server  
**Date**: 2026/04/06

## Prerequisites

- Node.js 18 or higher
- pnpm 8 or higher

## Setup Steps

### 1. Initialize the monorepo

```bash
# Clone or create project directory
cd wxt-browser-extensions

# Install dependencies
pnpm install
```

### 2. Applications Overview

This monorepo contains four packages:

| Package | Description | Port |
|---------|-------------|------|
| @wxt-ext/server | Hono API server | 3000 |
| @wxt-ext/extension | WXT browser extension | - |
| @wxt-ext/webclient | Vue SPA dashboard | 5173 |
| @wxt-ext/shared | Shared types and utilities | - |

### 3. Running the Applications

#### Development mode

```bash
# Run all applications in parallel
pnpm dev

# Or run individually
pnpm dev:server   # http://localhost:3000
pnpm dev:extension
pnpm dev:webclient # http://localhost:5173
```

#### Build all packages

```bash
pnpm build
```

### 4. Browser Extension

Load the extension in Chrome/Firefox:

```bash
# Build extension
pnpm build:extension

# The output is in apps/extension/.output/chrome-mv3/
```

### 5. Web Client

Access the dashboard at http://localhost:5173

## Directory Structure

```
.
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
├── apps/
│   ├── server/           # Hono API
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── config.ts
│   │   │   ├── routes/
│   │   │   └── middleware/
│   │   └── package.json
│   ├── extension/       # WXT
│   │   ├── entrypoints/
│   │   ├── wxt.config.ts
│   │   └── package.json
│   └── webclient/       # Vue SPA
│       ├── src/
│       │   ├── main.ts
│       │   ├── App.vue
│       │   ├── views/
│       │   └── services/
│       ├── vite.config.ts
│       └── package.json
└── packages/
    └── shared/           # Shared code
        ├── src/
        │   ├── index.ts
        │   ├── types.ts
        │   ├── config.ts
        │   └── api.ts
        └── package.json
```