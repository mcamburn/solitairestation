#!/bin/bash
set -e

# Post-merge setup — installs dependencies after any task merge
bun install --frozen-lockfile
