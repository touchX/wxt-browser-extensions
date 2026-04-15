# API Contract: Server Application

**Feature**: 002-pnpm-monorepo-server  
**Date**: 2026/04/06

## Overview

The server application exposes REST API endpoints. This contract defines the expected interface.

## Base Configuration

| Property | Value |
|----------|-------|
| Base URL | http://localhost:3000 |
| Protocol | HTTP |
| Format | JSON |

## Endpoints

### Health Check

| Property | Value |
|----------|-------|
| Method | GET |
| Path | /health |
| Response | `{"status": "ok"}` |

### API Status (placeholder for future expansion)

| Property | Value |
|----------|-------|
| Method | GET |
| Path | /api/status |
| Response | `{"version": "1.0.0", "timestamp": "<ISO timestamp>"}` |

## Error Responses

All endpoints may return:

| Status | Body |
|--------|------|
| 500 | `{"error": "Internal server error"}` |

## Notes

- This is a starting API contract. Additional endpoints will be added as features are implemented.
- CORS headers should be configured to allow the browser extension to communicate with the server.
- API versioning: v1 at `/api/v1/*`