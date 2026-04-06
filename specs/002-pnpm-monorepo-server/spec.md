# Feature Specification: Pnpm Monorepo with Server and Browser Extension

**Feature Branch**: `002-pnpm-monorepo-server`  
**Created**: 2026/04/06  
**Status**: Draft  
**Input**: User description: "使用pnpm 进行Monorepo 依赖管理, 包内会有两个应用，一个是Server应用，一个是 browser extension应用"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Initialize Monorepo Structure (Priority: P1)

[Developer sets up a pnpm monorepo with shared dependencies and workspace configuration]

**Why this priority**: This establishes the foundational structure for both applications. Without a proper monorepo setup, the two applications cannot share code or dependencies efficiently.

**Independent Test**: Can be verified by checking that `pnpm install` completes successfully and both applications can be individually built.

**Acceptance Scenarios**:

1. **Given** an empty project directory, **When** the developer initializes a pnpm workspace with a root `pnpm-workspace.yaml`, **Then** the workspace configuration is recognized by pnpm
2. **Given** a properly configured monorepo, **When** the developer runs `pnpm install` at the root, **Then** all dependencies are installed for both the server and extension packages
3. **Given** both applications exist in the workspace, **When** the developer runs `pnpm -r build`, **Then** both applications build successfully

---

### User Story 2 - Server Application Structure (Priority: P2)

[The monorepo contains a server application that can be developed and run independently]

**Why this priority**: The server application is one of the core components of the project and needs to be fully functional within the monorepo structure.

**Independent Test**: Can be verified by running the server application independently using its own scripts.

**Acceptance Scenarios**:

1. **Given** the monorepo is properly initialized, **When** the developer navigates to the server package directory, **Then** the server package has its own `package.json` with appropriate scripts
2. **Given** the server package is configured, **When** the developer runs the server start command, **Then** the server application starts and listens on its designated port
3. **Given** the server is running, **When** other packages in the workspace need to depend on the server, **Then** they can reference it via the workspace protocol

---

### User Story 3 - Browser Extension Application Structure (Priority: P2)

[The monorepo contains a browser extension application that can be developed and run independently]

**Why this priority**: The browser extension is the second core component and must also work independently within the monorepo.

**Independent Test**: Can be verified by running the extension's dev server and loading it in a browser.

**Acceptance Scenarios**:

1. **Given** the monorepo is properly initialized, **When** the developer navigates to the extension package directory, **Then** the extension package has its own `package.json` with appropriate scripts
2. **Given** the extension package is configured, **When** the developer runs the extension build command, **Then** the extension builds successfully and produces installable files
3. **Given** the extension package depends on shared code from the monorepo, **When** the extension builds, **Then** it correctly resolves and bundles the shared dependencies

---

### User Story 4 - Shared Code and Dependencies (Priority: P3)

[Both applications can share common code through the monorepo structure]

**Why this priority**: Code sharing reduces duplication and ensures consistency between the two applications.

**Independent Test**: Can be verified by creating a shared package and importing it in both applications.

**Acceptance Scenarios**:

1. **Given** a shared package exists in the monorepo, **When** the server application imports from it, **Then** the import resolves correctly without errors
2. **Given** a shared package exists in the monorepo, **When** the extension application imports from it, **Then** the import resolves correctly without errors
3. **Given** both applications use the same shared code, **When** changes are made to the shared package, **Then** both applications reflect those changes after rebuild

---

### User Story 5 - Web Client Application Structure (Priority: P2)

[The monorepo contains an independent web client application (Vue SPA) that provides management dashboard with data viewing, configuration management, and analytics]

**Why this priority**: The web client provides a full-featured management interface that complements the browser extension. Users can perform complete operations through the web app (data viewing, configuration, analytics) while using the extension for quick browser-integrated actions. This creates a clear functional division between the two client applications.

**Independent Test**: Can be verified by running the web client independently and confirming it can communicate with the server API and display data correctly.

**Acceptance Scenarios**:

1. **Given** the monorepo is properly initialized, **When** the developer navigates to the web client package directory, **Then** the web client package has its own `package.json` with appropriate scripts
2. **Given** the web client package is configured, **When** the developer runs the web client dev server, **Then** the web client starts on its designated port (default: 5173)
3. **Given** the web client is running, **When** it makes API calls to the server, **Then** the requests succeed and data is displayed correctly
4. **Given** the web client depends on shared code from the monorepo, **When** it builds, **Then** it correctly resolves and bundles the shared dependencies
5. **Given** the web client displays a dashboard, **When** the server provides data, **Then** the dashboard visualizes the data with charts and tables

---

### Edge Cases

- What happens when the server package is not yet developed but the extension or web client needs to communicate with it?
- How does the system handle version mismatches between shared packages?
- What if one application requires different versions of the same dependency?
- What happens when all three applications (server, extension, web client) run in development mode simultaneously?

## Clarifications

### Session 2026-04-06

- Q: 这个客户端应用的具体类型是什么？ → A: 独立 Web 客户端应用（Vue SPA，独立部署）
- Q: Web 客户端应用的核心功能范围是什么？ → A: 管理仪表板（数据查看、配置管理、分析报表）
- Q: 开发环境中的端口配置策略是什么？ → A: 固定端口分配（Server: 3000, Web Client: 5173, Extension dev: 自动）

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST use pnpm as the package manager with workspace configuration
- **FR-002**: System MUST define a `pnpm-workspace.yaml` at the root to manage multiple packages
- **FR-003**: System MUST include a server application package in the workspace
- **FR-004**: System MUST include a browser extension application package in the workspace
- **FR-005**: System MUST include a web client application package in the workspace
- **FR-006**: All three applications (server, extension, web client) MUST be independently runnable from their respective directories
- **FR-007**: All applications MUST be buildable using `pnpm -r` or individual package scripts
- **FR-008**: The workspace MUST support shared packages that can be imported by all three applications
- **FR-009**: Web client MUST provide dashboard interface for data viewing, configuration management, and analytics
- **FR-010**: Browser extension MUST provide quick actions for browser-integrated workflows
- **FR-011**: Web client and browser extension MUST share the same server API and data models

### Key Entities

- **Root Workspace Configuration**: The `pnpm-workspace.yaml` file defining package locations
- **Server Package**: The backend application package with REST API endpoints
- **Extension Package**: The browser extension package with popup and background service worker
- **Web Client Package**: The Vue SPA application package with dashboard interface
- **Shared Packages**: Common code packages (types, utilities, API clients) used by all three applications

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `pnpm install` at the root completes successfully and installs all dependencies for all three applications
- **SC-002**: All three applications (server, extension, web client) can be built independently without errors
- **SC-003**: All three applications can run in development mode simultaneously on different ports
- **SC-004**: Shared packages can be imported and used by all three applications without configuration issues
- **SC-005**: Web client dashboard can fetch and display data from server API
- **SC-006**: Browser extension can communicate with server API for data operations

## Assumptions

- The server application will use a REST API pattern for communication
- The browser extension will communicate with the server via HTTP requests
- Both applications will be developed using TypeScript for type safety
- The monorepo will follow a standard directory structure with `packages/` containing all sub-packages
- No external CI/CD integration is required for the initial setup
- Both applications will use compatible dependency versions or leverage pnpm's resolution