#!/bin/bash
# Script to create a new feature/page with the proper structure

if [ -z "$1" ]; then
  echo "Usage: ./scripts/create-feature.sh <feature-name>"
  echo "Example: ./scripts/create-feature.sh users"
  exit 1
fi

FEATURE_NAME=$1
# Project uses modules/ instead of src/features/
MODULE_PATH="modules/$FEATURE_NAME"
PAGE_PATH="app/(portal)/$FEATURE_NAME"

echo "Creating feature module: $MODULE_PATH"

# Create module directories
mkdir -p "$MODULE_PATH"/{components,hooks,types,services}

# Create index files
cat > "$MODULE_PATH/index.ts" << 'EOF'
export * from './components';
export * from './hooks';
export * from './types';
EOF

cat > "$MODULE_PATH/components/index.ts" << 'EOF'
// Add components here
EOF

cat > "$MODULE_PATH/hooks/index.ts" << 'EOF'
// Add hooks here
EOF

cat > "$MODULE_PATH/types/index.ts" << 'EOF'
// Define types here
EOF

cat > "$MODULE_PATH/services/index.ts" << 'EOF'
// Add API calls and business logic here
EOF

# Create Page structure
echo "Creating page routes: $PAGE_PATH"
mkdir -p "$PAGE_PATH"

# Create page.tsx with metadata stub
cat > "$PAGE_PATH/page.tsx" << 'EOF'
import { Metadata } from 'next';
// TODO: Import your page component from module
// import { FEATURE_NAME_CAPITALIZEDPage } from '@/modules/FEATURE_NAME';

export const metadata: Metadata = {
  title: 'FEATURE_NAME_CAPITALIZED',
  description: 'Manage FEATURE_NAME_CAPITALIZED',
};

export default function Page() {
  return (
    <div>
      <h1>FEATURE_NAME_CAPITALIZED Page</h1>
      {/* <FEATURE_NAME_CAPITALIZEDPage /> */}
    </div>
  );
}
EOF

# Create loading.tsx
cat > "$PAGE_PATH/loading.tsx" << 'EOF'
import { PageLoadingState } from '@/shared/ui/page/PageLoadingState';

export default function Loading() {
  return <PageLoadingState label="Loading FEATURE_NAME..." />;
}
EOF

# Create error.tsx
cat > "$PAGE_PATH/error.tsx" << 'EOF'
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { PageEmptyState } from '@/shared/ui/page/PageEmptyState';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('FEATURE_NAME Page Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] items-center justify-center p-6">
      <PageEmptyState
        icon={AlertTriangle}
        title="Something went wrong"
        description="We encountered an error while loading the FEATURE_NAME page."
        action={
          <div className="flex items-center gap-3">
            <Button onClick={reset} variant="outline" className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              Try again
            </Button>
            <Link href="/dashboard">
              <Button className="gap-2">
                <Home className="h-4 w-4" />
                Go to dashboard
              </Button>
            </Link>
          </div>
        }
      />
    </div>
  );
}
EOF

# Helper to capitalize
CAPITALIZED=$(echo "$FEATURE_NAME" | sed 's/./\U&/')

# Replace placeholders
sed -i "s/FEATURE_NAME_CAPITALIZED/$CAPITALIZED/g" "$MODULE_PATH"/**/* 2>/dev/null || true
sed -i "s/FEATURE_NAME/$FEATURE_NAME/g" "$MODULE_PATH"/**/* 2>/dev/null || true
sed -i "s/FEATURE_NAME_CAPITALIZED/$CAPITALIZED/g" "$PAGE_PATH"/*
sed -i "s/FEATURE_NAME/$FEATURE_NAME/g" "$PAGE_PATH"/*

echo "✅ Feature '$FEATURE_NAME' created successfully!"
echo "Module: $MODULE_PATH"
echo "Page: $PAGE_PATH"
