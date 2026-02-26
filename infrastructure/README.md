# Infrastructure

AWS CDK infrastructure for backend.

## Stack

The `backend-stack` creates:

- API Gateway REST API
- Lambda functions for each service
- API Gateway integrations for each Lambda
- Environment-specific configurations

## Deployment

```bash
# Deploy to dev
pnpm deploy:dev

# Deploy to production
pnpm deploy:prod

# Synthesize template
pnpm synth

# View changes
pnpm diff
```

## Configuration

The stack accepts a context variable `environment`:

- `dev` - Development environment
- `prod` - Production environment

