#!/bin/bash
# Script to create a new feature with the proper structure

if [ -z "$1" ]; then
  echo "Usage: ./scripts/create-feature.sh <feature-name>"
  echo "Example: ./scripts/create-feature.sh users"
  exit 1
fi

FEATURE_NAME=$1
FEATURE_PATH="src/features/$FEATURE_NAME"

echo "Creating feature: $FEATURE_NAME"

# Create directories
mkdir -p "$FEATURE_PATH"/{components,hooks,types,services,__tests__}

# Create index files
cat > "$FEATURE_PATH/index.ts" << 'EOF'
/**
 * FEATURE_NAME Feature
 */

export * from './components';
export * from './hooks';
export type * from './types';
EOF

cat > "$FEATURE_PATH/components/index.ts" << 'EOF'
/**
 * FEATURE_NAME Feature - Components
 */

// Add components here
// Example: export { MyComponent } from './MyComponent';
EOF

cat > "$FEATURE_PATH/hooks/index.ts" << 'EOF'
/**
 * FEATURE_NAME Feature - Hooks
 */

// Add hooks here
// Example: export { useMyData } from './useMyData';
EOF

cat > "$FEATURE_PATH/types/index.ts" << 'EOF'
/**
 * FEATURE_NAME Feature - Types
 */

// Define types here
// Example: export type { MyData } from './types.ts';
EOF

cat > "$FEATURE_PATH/services/index.ts" << 'EOF'
/**
 * FEATURE_NAME Feature - Services
 */

// Add API calls and business logic here
EOF

cat > "$FEATURE_PATH/__tests__/index.test.ts" << 'EOF'
import { describe, it, expect } from 'vitest';

describe('FEATURE_NAME', () => {
  it('should work', () => {
    expect(true).toBe(true);
  });
});
EOF

cat > "$FEATURE_PATH/README.md" << 'EOF'
# FEATURE_NAME Feature

## Overview
Brief description of this feature

## Structure
- **components/**: React components
- **hooks/**: Custom hooks
- **types/**: TypeScript types
- **services/**: API calls and business logic
- **__tests__/**: Tests

## Usage

\`\`\`typescript
import { Component, useData } from '@/features/FEATURE_NAME';
\`\`\`

## Components

### MyComponent
Description

## Hooks

### useMyData
Description
EOF

# Replace placeholders
sed -i "s/FEATURE_NAME/$FEATURE_NAME/g" "$FEATURE_PATH"/*
sed -i "s/FEATURE_NAME/$FEATURE_NAME/g" "$FEATURE_PATH"/**/*

echo "✅ Feature '$FEATURE_NAME' created at $FEATURE_PATH"
echo ""
echo "Next steps:"
echo "1. Add components to src/features/$FEATURE_NAME/components/"
echo "2. Add hooks to src/features/$FEATURE_NAME/hooks/"
echo "3. Update types in src/features/$FEATURE_NAME/types/"
echo "4. Add services to src/features/$FEATURE_NAME/services/"
echo "5. Add tests to src/features/$FEATURE_NAME/__tests__/"
