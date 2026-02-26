# Lambda Bundling with CDK NodejsFunction

## Overview

Lambda functions use **AWS CDK's `NodejsFunction`** construct, which runs **esbuild** internally. It bundles the Lambda entry and workspace packages (`@project-name/shared-`*) into a single deployment asset. Dependencies provided by Lambda Layers are marked as external and loaded at runtime.

## How It Works

### Build Process

1. **Deploy / Synth**: When you run `cdk deploy` or `cdk synth`, CDK runs esbuild for each `NodejsFunction`.
2. **Entry**: Each function’s entry is `lambdas/<name>/src/lambda.ts`.
3. **Resolution**: The lambda’s `tsconfig.json` path aliases resolve `@project-name/shared-`* to `shared/*/src`, so shared code is bundled from source (no pre-build of shared packages needed for deploy).
4. **Externals**: Layer-provided modules (NestJS, Prisma, bcrypt, etc.) are in `bundling.externalModules` and are not bundled.

### Shared Packages Resolution

- Each lambda’s `tsconfig.json` has `paths` for `@project-name/shared-utils`, `@project-name/shared-services`, etc., pointing to `../../shared/<pkg>/src/index.ts`.
- `NodejsFunction` is configured with that tsconfig, so esbuild uses these paths and bundles shared code from source.

## Usage

### Deploy (Bundling Happens Here)

```bash
pnpm deploy:dev
# or
cd infrastructure && cdk deploy --all --context environment=dev
```

**Do not** run `pnpm build:shared` or build any lambda before deploy. CDK + esbuild read source directly; pre-building wastes time and is not used.

### Local: Lint & Test Only

```bash
cd lambdas/function-name
pnpm lint
pnpm test
```

Lambdas have no build target; `pnpm build:lambdas` prints a reminder to use deploy.

## CDK Integration

The stack uses `NodejsFunction` instead of `lambda.Function` + pre-built assets:

```typescript
import { NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';

new NodejsFunction(this, `${functionName}-function`, {
  entry: path.join(repoRoot, 'lambdas', functionName, 'src', 'lambda.ts'),
  runtime: lambda.Runtime.NODEJS_20_X,
  layers: requiredLayers,
  bundling: {
    externalModules: [/* layer-provided deps */],
    format: OutputFormat.CJS,
    tsconfig: path.join(repoRoot, 'lambdas', functionName, 'tsconfig.json'),
    keepNames: true, // NestJS decorators
    minify: environment === 'prod',
    target: 'node20',
  },
});
```

## Benefits

1. **Single bundling step**: No custom `build.js` or `build-lambda.js` for deploy.
2. **Workspace support**: Path aliases in tsconfig make `@project-name/shared-`* bundle from source.
3. **Consistent with CDK**: Uses the same NodejsFunction pattern as standard CDK apps.
4. **Layers**: Layer deps stay external; no need to pre-build shared packages for lambda deploy.

## Troubleshooting

### “Cannot find module” during synth

- Ensure the lambda’s `tsconfig.json` has correct `paths` for `@project-name/shared-`*.
- Paths should point to `../../shared/<pkg>/src/index.ts` (or the real entry) relative to the lambda dir.

### Module not found at runtime

- Confirm the module is listed in `externalModules` in the stack (it will come from the layer).
- Check that the corresponding layer is attached to the function and includes that dependency.

### Adding a new lambda

1. Add `lambdas/<name>/src/lambda.ts` and a `tsconfig.json` with path aliases for `@project-name/*`.
2. In the stack, add the function name to `functionNames` and define its layers in `functionLayers`.
3. Create the `NodejsFunction` with the same pattern (entry, tsconfig, externalModules, layers).

Bundling is handled entirely by CDK’s `NodejsFunction`; no custom build scripts are used for deploy.