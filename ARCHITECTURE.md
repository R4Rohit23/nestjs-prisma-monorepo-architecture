# Architecture Overview

## Monorepo Structure

This project follows a monorepo architecture using pnpm workspaces for managing multiple Lambda functions and infrastructure code.

## Directory Structure

```
project-name-backend/
├── lambdas/                    # Lambda function packages
│   ├── user-service/          # User management service
│   │   ├── src/
│   │   │   └── index.ts      # Lambda handler
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── auth-service/          # Authentication service
│
├── shared/                     # Shared packages
│   ├── types/                 # Shared TypeScript types
│   ├── utils/                 # Shared utility functions
│   ├── constants/             # Shared constants
│
├── infrastructure/             # AWS CDK infrastructure
│   ├── bin/
│   │   └── infrastructure.ts # CDK app entry point
│   ├── lib/
│   │   └── project-name-stack.ts # Main CDK stack
│   ├── cdk.json               # CDK configuration
│   └── package.json
│
├── .github/
│   └── workflows/
│       ├── ci.yml             # Continuous Integration
│       └── deploy.yml         # Deployment pipeline
│
├── pnpm-workspace.yaml        # Workspace configuration
└── package.json               # Root package.json
```

## Workflow

1. **Development**: Developers work on individual Lambda functions in `lambdas/` and shared packages in `shared/`
2. **Build**: Shared packages are built first, then Lambda functions (which depend on shared packages), then infrastructure
3. **Infrastructure**: CDK stack packages Lambda functions and deploys to AWS
4. **CI/CD**: GitHub Actions automatically builds and deploys on push/PR

## Shared Packages

Shared packages provide common functionality across all Lambda functions:

- **Types**: Common TypeScript interfaces and types
- **Utils**: Response formatters, event parsers, validators, logger
- **Constants**: Configuration values, validation constraints, API routes

Lambda functions import and use these shared packages via workspace dependencies.

## Adding a New Lambda Function

1. Create directory: `lambdas/new-service/`
2. Add `package.json`, `tsconfig.json`, and `src/index.ts`
3. Add service name to `infrastructure/lib/project-name-stack.ts` in `functionNames` array
4. The CDK stack will automatically:
  - Create the Lambda function
  - Create API Gateway route
  - Set up integration

## Deployment Flow

```
GitHub Push/PR
    ↓
GitHub Actions Trigger
    ↓
Install Dependencies
    ↓
Build Lambda Functions
    ↓
Build CDK Infrastructure
    ↓
Deploy to AWS (dev/prod)
```

## Environment Management

- **dev**: Development environment (deployed from `dev`branch)
- **prod**: Production environment (deployed from `main` branch)

Each environment gets its own:

- API Gateway stage
- Lambda function versions
- Environment variables

