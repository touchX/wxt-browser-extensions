# Tasks: Pnpm Monorepo with Server, Browser Extension, and Web Client

**Input**: Design documents from `/specs/002-pnpm-monorepo-server/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/server-api.md, quickstart.md

**Tests**: Tests were not explicitly requested in the feature specification. Test tasks are not included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

- **Monorepo structure**: `apps/` for applications, `packages/` for shared code
- **Root**: Configuration files at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic monorepo structure

- [ ] T001 Create root directory structure with apps/ and packages/ directories
- [ ] T002 Initialize pnpm workspace with pnpm-workspace.yaml at root
- [ ] T003 [P] Create root package.json with workspace metadata and scripts
- [ ] T004 [P] Configure TypeScript for monorepo with shared tsconfig.base.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core package infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Configure workspace protocol and package naming convention (@wxt-ext/*)
- [ ] T006 [P] Setup shared TypeScript configuration in tsconfig.base.json
- [ ] T007 [P] Configure root-level scripts (dev, build, test, start) for workspace management
- [ ] T008 Initialize Git repository with appropriate .gitignore for monorepo

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Initialize Monorepo Structure (Priority: P1) 🎯 MVP

**Goal**: Establish the foundational monorepo structure with pnpm workspace configuration

**Independent Test**: Verify that `pnpm install` completes successfully and all application packages can be individually built

### Implementation for User Story 1

- [ ] T009 [P] [US1] Create apps/server/package.json with Hono dependencies and scripts
- [ ] T010 [P] [US1] Create apps/extension/package.json with WXT dependencies and scripts
- [ ] T011 [P] [US1] Create apps/webclient/package.json with Vue and Vite dependencies
- [ ] T012 [P] [US1] Create packages/shared/package.json with TypeScript configuration
- [ ] T013 [US1] Create pnpm-workspace.yaml with apps/* and packages/* patterns at root
- [ ] T014 [P] [US1] Create apps/server/tsconfig.json extending shared base configuration
- [ ] T015 [P] [US1] Create apps/extension/tsconfig.json extending shared base configuration
- [ ] T016 [P] [US1] Create apps/webclient/tsconfig.json extending shared base configuration
- [ ] T017 [US1] Verify workspace with pnpm install and ensure all packages resolve dependencies

**Checkpoint**: At this point, User Story 1 should be fully functional - monorepo structure is operational and all three packages can install dependencies

---

## Phase 4: User Story 2 - Server Application Structure (Priority: P2)

**Goal**: Implement a functional Hono server application within the monorepo

**Independent Test**: Run the server application independently and verify it starts on the designated port

### Implementation for User Story 2

- [ ] T018 [P] [US2] Create apps/server/src/index.ts with Hono app initialization
- [ ] T019 [P] [US2] Implement health check endpoint GET /health in apps/server/src/routes/health.ts
- [ ] T020 [P] [US2] Implement API status endpoint GET /api/status in apps/server/src/routes/status.ts
- [ ] T021 [US2] Configure CORS middleware for browser extension and web client communication in apps/server/src/middleware/cors.ts
- [ ] T022 [US2] Create server build configuration and scripts in apps/server/package.json
- [ ] T023 [US2] Add port configuration (default: 3000) to apps/server/src/config.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - server is fully functional

---

## Phase 5: User Story 3 - Browser Extension Application Structure (Priority: P2)

**Goal**: Implement a functional WXT browser extension within the monorepo

**Independent Test**: Build the extension and load it in Chrome/Firefox to verify it works independently

### Implementation for User Story 3

- [ ] T024 [P] [US3] Create extension manifest configuration in apps/extension/wxt.config.ts
- [ ] T025 [P] [US3] Create basic popup UI in apps/extension/entrypoints/popup.vue
- [ ] T026 [P] [US3] Create popup entry in apps/extension/entrypoints/popup.html
- [ ] T027 [P] [US3] Create background service worker in apps/extension/entrypoints/background.ts
- [ ] T028 [US3] Configure extension build script in apps/extension/package.json
- [ ] T029 [US3] Verify extension builds and produces installable files in .wxt/ directory

**Checkpoint**: At this point, User Stories 1-3 should all work independently - extension builds successfully

---

## Phase 6: User Story 4 - Shared Code and Dependencies (Priority: P3)

**Goal**: Create shared packages that all three applications can import and use

**Independent Test**: Create a shared utility and import it in server, extension, and web client applications

### Implementation for User Story 4

- [ ] T030 [P] [US4] Create packages/shared/src/index.ts with exported utility functions
- [ ] T031 [P] [US4] Create packages/shared/src/types.ts with shared TypeScript interfaces
- [ ] T032 [P] [US4] Create packages/shared/src/config.ts with API endpoints configuration
- [ ] T033 [US4] Configure packages/shared/package.json with proper exports field
- [ ] T034 [P] [US4] Create packages/shared/tsconfig.json with build configuration
- [ ] T035 [US4] Add @wxt-ext/shared dependency to apps/server/package.json
- [ ] T036 [US4] Add @wxt-ext/shared dependency to apps/extension/package.json
- [ ] T037 [US4] Add @wxt-ext/shared dependency to apps/webclient/package.json
- [ ] T038 [US4] Verify shared imports resolve correctly in all three applications via workspace protocol

**Checkpoint**: At this point, code sharing works across all three applications

---

## Phase 7: User Story 5 - Web Client Dashboard Application (Priority: P2)

**Goal**: Implement an independent Vue SPA web client with dashboard interface (data viewing, configuration management, analytics)

**Independent Test**: Run the web client independently and verify it can fetch data from server API

### Implementation for User Story 5

- [ ] T039 [P] [US5] Create apps/webclient/vite.config.ts with Vue plugin and proxy configuration
- [ ] T040 [P] [US5] Create apps/webclient/index.html with root mount point
- [ ] T041 [P] [US5] Create apps/webclient/src/main.ts with Vue app initialization
- [ ] T042 [P] [US5] Create apps/webclient/src/App.vue with dashboard layout
- [ ] T043 [P] [US5] Create apps/webclient/src/views/Dashboard.vue with data tables and charts
- [ ] T044 [US5] Create apps/webclient/src/views/Settings.vue with configuration interface
- [ ] T045 [US5] Implement API client service in apps/webclient/src/services/api.ts
- [ ] T046 [US5] Configure port 5173 in apps/webclient/package.json dev script
- [ ] T047 [US5] Verify web client builds and runs on port 5173

**Checkpoint**: At this point, all three client applications (extension, web client) are functional and can communicate with server

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T048 [P] Create README.md in root with monorepo setup and development instructions
- [ ] T049 [P] Add workspace scripts to root package.json for convenience (dev:all, build:all, test:all)
- [ ] T050 [P] Create shared API client in packages/shared/src/api.ts for use by extension and web client
- [ ] T051 Code cleanup and remove any placeholder or TODO comments
- [ ] T052 Update quickstart.md with web client setup instructions
- [ ] T053 Run complete workflow validation: install → build all → run all

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P2 → P3)
  - US2 (Server) and US3 (Extension) and US5 (Web Client) can be done in parallel (all P2)
  - US4 (Shared) can be started once any application package exists
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories - **MVP**
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent from US1
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Independent from US1 and US2
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - Requires US1, US2, and US3 to exist for integration testing
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - Independent from US1-US3, but benefits from US4 shared API client

### Within Each User Story

- Package.json files before source files
- Core structure before specific implementations
- Individual package setup before workspace integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes:
  - US2 (Server), US3 (Extension), and US5 (Web Client) can be worked on in parallel (all P2)
  - US4 (Shared) can be started once any application package exists
- Within US1: All package.json files can be created in parallel
- Within US2: Health and status routes can be implemented in parallel
- Within US3: All WXT entrypoints can be created in parallel
- Within US4: Shared source files can be created in parallel
- Within US5: Vue components and services can be created in parallel

---

## Parallel Example: After Foundational Phase (Three Applications)

```bash
# With multiple developers or fast context switching:
# Developer A: User Story 2 (Server Application)
# Developer B: User Story 3 (Browser Extension) - can run in parallel with US2
# Developer C: User Story 5 (Web Client) - can run in parallel with US2 and US3

# Once applications exist, any developer can work on:
# User Story 4 (Shared Code)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (all three packages)
4. **STOP and VALIDATE**: Verify pnpm install works and all three package structures exist
5. Demo monorepo structure with three application packages

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Validate workspace (MVP!)
3. Add User Story 2 → Test independently → Run server
4. Add User Story 3 → Test independently → Build and load extension
5. Add User Story 4 → Test independently → Verify code sharing
6. Add User Story 5 → Test independently → Run web client
7. Each story adds value without breaking previous stories

### Parallel Team Strategy (Recommended for Three Applications)

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 2 (Server Application)
   - Developer B: User Story 3 (Browser Extension)
   - Developer C: User Story 5 (Web Client Application)
3. Once applications exist:
   - Any developer: User Story 4 (Shared Code)
4. Stories complete and integrate independently

---

## Summary

**Total Tasks**: 53
**Per User Story**:
- Setup: 4 tasks
- Foundational: 4 tasks
- US1 (P1): 9 tasks (expanded to include webclient package)
- US2 (P2): 6 tasks
- US3 (P2): 6 tasks
- US4 (P3): 9 tasks (expanded to include webclient)
- US5 (P2): 9 tasks (NEW - Web Client Application)
- Polish: 6 tasks

**Parallel Opportunities**: 25 tasks marked [P] can run in parallel within their phases

**Independent Test Criteria**:
- US1: `pnpm install` succeeds, all three packages build
- US2: Server starts and responds to /health
- US3: Extension builds and loads in browser
- US4: All three apps import from shared package
- US5: Web client runs on port 5173 and fetches from server

**Suggested MVP Scope**: Phase 1-3 (Setup + Foundational + US1) = 17 tasks
- Delivers: Working monorepo with three application package structures
- Enables: Parallel development of US2, US3, and US5

**Updated Architecture**:
```
Monorepo with 3 Client Applications + 1 Shared Package:
├── apps/server/      (Hono API - port 3000)
├── apps/extension/   (WXT + Vue - browser extension)
├── apps/webclient/   (Vue SPA + Vite - port 5173)
└── packages/shared/   (Shared types, utils, API client)
```

**Format Validation**: ✅ All tasks follow the checklist format:
- Checkbox: `- [ ]`
- Task ID: T001-T053
- [P] marker: Applied to parallelizable tasks
- [Story] label: Applied to US1-US5 tasks only
- File paths: Included in all implementation tasks
