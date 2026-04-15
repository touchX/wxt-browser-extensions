# Research: Pnpm Monorepo with Server and Browser Extension

**Feature**: 002-pnpm-monorepo-server  
**Date**: 2026/04/06

## Research Tasks

### Server Framework Selection
- **Decision**: Use Hono (lightweight, fast, works well in monorepo)
- **Rationale**: Hono is a modern, fast web framework that works well with TypeScript and has minimal dependencies. It integrates well with pnpm workspaces.
- **Alternatives considered**: Express (more popular but heavier), FastAPI (Python-based, not ideal for this project)

### Testing Framework Selection
- **Decision**: Vitest (with Vite)
- **Rationale**: Vitest is the standard testing framework for Vite-based projects and works well with TypeScript. It provides fast test execution and great DX.
- **Alternatives considered**: Jest (older, slower), ts-jest (TypeScript-first but slower)

### Monorepo Structure
- **Decision**: Standard pnpm workspace with `apps/` and `packages/` directories
- **Rationale**: This is the most common and well-supported pattern for pnpm monorepos. `apps/` contains the two applications, `packages/` contains shared code.

## Summary

The research confirms that the project can proceed with:
- TypeScript for type safety
- pnpm 8+ for workspace management
- Hono for the server framework
- Vitest for testing
- Standard `apps/` + `packages/` directory structure