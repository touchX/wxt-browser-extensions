# Quickstart: Pnpm Monorepo with Server and Browser Extension

**Feature**: 002-pnpm-monorepo-server  
**Date**: 2026/04/06

## Prerequisites

- Node.js 18 or higher
- pnpm 8 or higher

## Setup Steps

### 1. Initialize the monorepo

```bash
# Create project directory
mkdir my-monorepo && cd my-monorepo

# Initialize pnpm
pnpm init

# Create pnpm-workspace.yaml
echo 'packages:
  - "apps/*"
  - "packages/*"' > pnpm-workspace.yaml
```

### 2. Create the server application

```bash
# Create apps directory structure
mkdir -p apps/server/src

# Create server package.json
cat > apps/server/package.json << 'EOF'
{
  "name": "@myapp/server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
EOF
```

### 3. Create the browser extension application

```bash
# Create extension directory structure
mkdir -p apps/extension/src

# Initialize WXT project in apps/extension
cd apps/extension && pnpm create wxt . --template vue
```

### 4. Create shared packages

```bash
# Create packages directory
mkdir -p packages/shared/src

# Create shared package.json
cat > packages/shared/package.json << 'EOF'
{
  "name": "@myapp/shared",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  }
}
EOF
```

### 5. Install dependencies

```bash
# From root directory
pnpm install
```

## Running the Applications

### Development mode (both apps)

```bash
# Run server (in one terminal)
cd apps/server && pnpm dev

# Run extension (in another terminal)
cd apps/extension && pnpm dev
```

### Build all packages

```bash
pnpm -r build
```

## Directory Structure

```
.
├── pnpm-workspace.yaml
├── package.json
├── apps/
│   ├── server/
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── extension/
│       ├── src/
│       ├── package.json
│       └── wxt.config.ts
└── packages/
    └── shared/
        ├── src/
        ├── package.json
        └── tsconfig.json
```