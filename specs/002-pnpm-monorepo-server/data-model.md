# Data Model: Pnpm Monorepo Structure

**Feature**: 002-pnpm-monorepo-server  
**Date**: 2026/04/06

## Entities

### Workspace Configuration

| Field | Type | Description |
|-------|------|-------------|
| name | string | Project name (e.g., "my-monorepo") |
| packages | string[] | Glob patterns for packages (e.g., ["apps/*", "packages/*"]) |

### Server Application Package

| Field | Type | Description |
|-------|------|-------------|
| name | string | Package name with workspace prefix (e.g., "@myapp/server") |
| type | string | Module type ("module" or "commonjs") |
| scripts.dev | string | Development server command |
| scripts.build | string | Build command |
| scripts.start | string | Production start command |

### Browser Extension Application Package

| Field | Type | Description |
|-------|------|-------------|
| name | string | Package name (e.g., "@myapp/extension") |
| type | string | Module type |
| scripts.dev | string | WXT dev command |
| scripts.build | string | WXT build command |

### Shared Package

| Field | Type | Description |
|-------|------|-------------|
| name | string | Package name (e.g., "@myapp/shared") |
| type | string | Module type |
| main | string | Entry point (e.g., "./dist/index.js") |
| types | string | Type declarations (e.g., "./dist/index.d.ts") |

## Relationships

- Root `package.json` defines workspace name and version
- Root `pnpm-workspace.yaml` defines package locations
- `apps/server` depends on `packages/shared`
- `apps/extension` depends on `packages/shared`

## Validation Rules

- All package names must follow the pattern `@<workspace-name>/<package-name>`
- All packages must have unique names within the workspace
- Shared packages must export TypeScript type definitions
- Server must expose a port configuration (default: 3000)