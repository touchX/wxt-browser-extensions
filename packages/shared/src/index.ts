// Main exports for @wxt-ext/shared
export * from './types';
export * from './config';
export * from './api';

// Placeholder utility functions
export function createLogger(context: string) {
  return {
    info: (message: string, ...args: unknown[]) => console.log(`[${context}] ${message}`, ...args),
    error: (message: string, ...args: unknown[]) => console.error(`[${context}] ${message}`, ...args),
    warn: (message: string, ...args: unknown[]) => console.warn(`[${context}] ${message}`, ...args),
  };
}
