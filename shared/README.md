# Shared Packages

Shared packages used across all Lambda functions and APIs in the <project-name> backend monorepo.

## Packages

### @project-name/shared-types

Common TypeScript types, interfaces, and enums used across services.

**Exports:**

- `ApiResponse<T>` - Standard API response structure
- `HttpStatus` - HTTP status code enum
- `ErrorCode` - Error code enum
- `User`, `Prompt` - Entity types
- `PaginationParams`, `PaginatedResponse<T>` - Pagination types
- `ParsedApiEvent` - Parsed API Gateway event
- `LambdaContext` - Lambda handler context

**Usage:**

```typescript
import { ApiResponse, HttpStatus, User } from '@project-name/shared-types';
```

### @project-name/shared-utils

Common utility functions for Lambda handlers.

**Exports:**

- **Response utilities**: `successResponse`, `errorResponse`, `validationErrorResponse`, `notFoundResponse`, `unauthorizedResponse`, `internalErrorResponse`
- **Event parsing**: `parseApiEvent`, `getUserIdFromEvent`, `getAuthTokenFromEvent`
- **Logging**: `Logger` class, `createLogger` function
- **Validation**: `isValidEmail`, `validateRequiredFields`, `validateStringLength`, `isValidUUID`, `sanitizeString`, `validatePagination`

**Usage:**

```typescript
import { 
  successResponse, 
  parseApiEvent, 
  createLogger,
  validateRequiredFields 
} from '@project-name/shared-utils';
```

### @project-name/shared-constants

Shared constants and configuration values.

**Exports:**

- `ENVIRONMENTS` - Environment names
- `HTTP_METHODS` - HTTP method constants
- `PAGINATION` - Default pagination values
- `VALIDATION` - Validation constraints
- `API_ROUTES` - API route paths
- `TABLE_NAMES` - DynamoDB table names
- `AWS_REGION` - AWS region
- `CORS_HEADERS` - CORS headers

**Usage:**

```typescript
import { PAGINATION, VALIDATION, API_ROUTES } from '@project-name/shared-constants';
```

## Building

Build all shared packages:

```bash
pnpm build:shared
```

Build individual package:

```bash
cd shared/types
pnpm build
```

## Adding New Shared Code

1. Determine which package it belongs to (or create a new one)
2. Add the code to the appropriate `src/` directory
3. Export from `src/index.ts`
4. Build the package: `pnpm build`
5. Update dependent packages to use the new code

## Dependencies

Shared packages can depend on each other:

- `shared-utils` depends on `shared-types`

Lambda functions should depend on shared packages, not on each other.