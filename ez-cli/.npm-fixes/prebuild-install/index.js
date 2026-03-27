#!/usr/bin/env node
// Silent shim for prebuild-install to avoid deprecation warnings.
// This forces better-sqlite3 to fall back to building from source natively.
process.exit(1); 
