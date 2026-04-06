# Implementation Plan: Pnpm Monorepo with Server, Browser Extension, and Web Client

**Branch**: `002-pnpm-monorepo-server` | **Date**: 2026-04-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-pnpm-monorepo-server/spec.md`

**Note**: This plan is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

本功能旨在创建一个基于 pnpm workspace 的 Monorepo 项目，包含三个独立应用：

1. **Server 应用** (Hono): HTTP API 服务，端口 3000
2. **Browser Extension 应用** (WXT + Vue): 浏览器扩展，Manifest V3
3. **Web Client 应用** (Vue SPA): 管理仪表板，端口 5173

所有应用共享一个 `packages/shared` 包，包含通用类型、工具和 API 客户端。

**技术方法**:
- 使用 pnpm workspace 管理依赖和包引用
- TypeScript 提供类型安全
- Hono 作为轻量级服务器框架
- WXT 框架构建浏览器扩展
- Vite + Vue 3 构建 Web 客户端
- 共享包实现代码复用

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 18+
**Primary Dependencies**:
- Server: Hono 4.x, @hono/cors
- Extension: WXT 0.19+, Vue 3.4+, @wxt-dev/module-vue
- Web Client: Vite 5.x, Vue 3.4+, Vue Router, Pinia
- Shared: TypeScript 5.x
- Build: pnpm 8+, Vite 5.4+, esbuild

**Storage**: N/A (API-based architecture, future database integration planned)
**Testing**: Vitest (planned, not in MVP scope)
**Target Platform**:
- Server: Node.js 18+ (Linux/macOS/Windows)
- Extension: Chrome 88+, Firefox 78+ (Manifest V3)
- Web Client: Modern browsers (ES2020+)

**Project Type**: monorepo (multi-application workspace)
**Performance Goals**:
- Server: <100ms p95 response time for health/status endpoints
- Extension build: <1MB output size
- Web client: <2s initial load time
- Dev server: <1s hot reload

**Constraints**:
- No external database required for MVP (in-memory state)
- Must support running all three apps simultaneously in dev mode
- Fixed port allocation (Server: 3000, Web Client: 5173, Extension: auto)
- Workspace protocol for internal dependencies (@wxt-ext/*)

**Scale/Scope**:
- 3 application packages (server, extension, webclient)
- 1 shared package (types, utilities, API client)
- ~10 API endpoints (MVP: 2 endpoints)
- 3-5 extension UI components
- 5-10 web client views/pages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ⚠️ **Constitution document not yet customized**

The constitution file at `.specify/memory/constitution.md` is still in template form. No project-specific principles are defined yet.

**Interim Gates** (based on best practices):
- [ ] **Simplicity**: Start with minimal viable features, avoid over-engineering
- [ ] **Independence**: Each application must be runnable and buildable independently
- [ ] **Type Safety**: TypeScript strict mode enabled for all packages
- [ ] **Documentation**: README.md for each package explaining purpose and usage
- [ ] **No Hardcoded Values**: Configuration externalized to environment variables or config files

**Re-evaluation**: After Phase 1 design, reassess against a customized constitution.

## Project Structure

### Documentation (this feature)

```text
specs/002-pnpm-monorepo-server/
├── plan.md              # This file
├── research.md          # Technology research findings
├── data-model.md        # Workspace and package data structures
├── quickstart.md        # Developer onboarding guide
├── contracts/           # API contracts
│   └── server-api.md    # Server REST API specification
├── tasks.md             # Implementation task breakdown
└── 002-REVIEWS.md       # Cross-AI review results
```

### Source Code (repository root)

**Selected Structure**: Monorepo with apps/ and packages/ separation

```text
.
├── apps/
│   ├── server/              # Hono API server (port 3000)
│   │   ├── src/
│   │   │   ├── index.ts     # Hono app initialization
│   │   │   ├── routes/
│   │   │   │   ├── health.ts    # GET /health
│   │   │   │   └── status.ts    # GET /api/status
│   │   │   ├── middleware/
│   │   │   │   └── cors.ts      # CORS configuration
│   │   │   └── config.ts        # Port, env config
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── extension/           # WXT browser extension
│   │   ├── entrypoints/
│   │   │   ├── popup.vue       # Extension popup UI
│   │   │   ├── popup.html      # Popup HTML template
│   │   │   └── background.ts   # Service worker
│   │   ├── wxt.config.ts       # WXT configuration
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── webclient/           # Vue SPA dashboard (port 5173)
│       ├── src/
│       │   ├── main.ts          # Vue app initialization
│       │   ├── App.vue          # Root component
│       │   ├── views/
│       │   │   ├── Dashboard.vue  # Data visualization
│       │   │   └── Settings.vue   # Configuration UI
│       │   └── services/
│       │       └── api.ts          # API client service
│       ├── index.html
│       ├── vite.config.ts         # Vite + proxy config
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   └── shared/              # Shared code
│       ├── src/
│       │   ├── index.ts        # Main exports
│       │   ├── types.ts        # Shared TypeScript interfaces
│       │   ├── config.ts       # API endpoints config
│       │   └── api.ts          # Shared API client
│       ├── package.json
│       └── tsconfig.json
│
├── pnpm-workspace.yaml     # Workspace definition
├── package.json            # Root package with workspace scripts
├── tsconfig.base.json      # Shared TypeScript config
├── .gitignore
└── README.md               # Monorepo setup guide
```

**Structure Decision**: The `apps/` directory contains runnable applications (server, extension, webclient), while `packages/` contains libraries that are imported by applications. This separation:
- Clearly distinguishes between apps and libraries
- Follows pnpm workspace conventions
- Enables independent development and testing of each component
- Supports workspace protocol imports like `@wxt-ext/shared`

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations identified at this stage. The project follows standard monorepo patterns with no anti-patterns or unnecessary complexity.

---

## Implementation Phases

### Phase 0: Research (Completed ✅)

**Output**: research.md with technology decisions

**Key Decisions**:
- Hono over Express (lightweight, better TypeScript support)
- Vitest over Jest (faster, Vite-native)
- Standard apps/ + packages/ structure (well-supported pattern)

### Phase 1: Design & Contracts (Completed ✅)

**Outputs**:
- data-model.md: Workspace and package schemas
- contracts/server-api.md: API contract for health/status endpoints
- quickstart.md: Developer onboarding guide

### Phase 2: Task Breakdown (Completed ✅)

**Output**: tasks.md with 53 tasks across 8 phases

**Execution Order**:
1. Phase 1: Setup (4 tasks) - Root structure
2. Phase 2: Foundational (4 tasks) - Workspace configuration
3. Phase 3-7: User Stories (US1-US5) - Can proceed in parallel after foundation
4. Phase 8: Polish (6 tasks) - Cross-cutting improvements

### Phase 3: Execution (In Progress 🔄)

**Current Status**: Ready to begin Phase 1 (Setup)

**Immediate Next Steps**:
1. Create root directory structure (apps/, packages/)
2. Initialize pnpm-workspace.yaml
3. Create root package.json with workspace scripts
4. Configure tsconfig.base.json

**Success Criteria**:
- All 53 tasks completed
- All three applications build and run independently
- Shared package imports work correctly
- Documentation is complete and accurate

---

## Error Handling Strategy

**Server Application**:
- Try-catch wrappers around all route handlers
- Consistent error response format: `{error: string, status?: number}`
- Graceful degradation for health/status endpoints
- CORS error handling with clear messages

**Browser Extension**:
- Fetch error handling with retry logic
- User-friendly error messages in UI
- Graceful handling of server unavailability

**Web Client**:
- API error interceptors in service layer
- User notifications for failed requests
- Fallback UI for error states

---

## Security Considerations

**Immediate (MVP)**:
- CORS properly configured for browser extension and web client
- Input validation on API endpoints
- No hardcoded secrets or sensitive data

**Future (Post-MVP)**:
- Authentication/authorization for API endpoints
- Content Security Policy for browser extension
- HTTPS enforcement for production
- Rate limiting on API endpoints
- Secret management via environment variables

---

## Testing Strategy

**Note**: Tests were not explicitly requested in the feature specification. Test tasks are not included in the initial scope.

**Future Testing Plan** (when tests are added):
- Unit tests for shared utilities (Vitest)
- Integration tests for server API endpoints (Vitest + Hono test utilities)
- E2E tests for browser extension (Playwright)
- Component tests for web client (Vitest + Vue Test Utils)

---

## Risk Mitigation

| Risk | Mitigation Strategy |
|------|---------------------|
| Port conflicts in development | Fixed port allocation documented, configurable via env |
| Workspace dependency resolution | Use workspace protocol (@wxt-ext/*), verify imports |
| Build complexity | Build each app independently before combining |
| TypeScript configuration issues | Use project references, shared tsconfig.base.json |
| Extension loading issues | Clear build instructions, test on Chrome/Firefox |

---

## Glossary

- **Workspace Protocol**: pnpm's feature for referencing local packages (e.g., `@wxt-ext/shared`)
- **Manifest V3**: Latest browser extension format (Chrome/Firefox)
- **Service Worker**: Background script in Manifest V3 extensions
- **Hot Module Replacement (HMR)**: Fast dev server updates without page reload
- **Port Allocation**: Assigning fixed ports to dev servers (3000, 5173)
