import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';
import { Construct } from 'constructs';

export type LayerName = 'nest' | 'auth' | 'aws';

export interface LambdaProps {
  /**
   * The environment (dev, prod, etc.)
   */
  environment: string;

  /**
   * Absolute path to the monorepo root (where lambdas/, shared/, layers/ live).
   */
  repoRoot: string;

  /**
   * Optional API Gateway to attach Lambda integrations and routes.
   */
  api?: apigateway.RestApi;

  /**
   * Environment variables to pass to all Lambda functions.
   */
  environmentVariables?: Record<string, string>;
}

export class Lambda extends Construct {
  public readonly layers: Map<string, lambda.LayerVersion>;
  public readonly functions: Map<string, lambda.Function>;
  public readonly stackName = process.env.STACK_ID;

  constructor(scope: Construct, id: string, props: LambdaProps) {
    super(scope, id);

    const { environment, repoRoot, api, environmentVariables } = props;

    this.layers = this.createLayers(environment, repoRoot);
    this.functions = this.createFunctions(environment, repoRoot, environmentVariables);

    if (api) {
      this.attachToApi(api);
    }
  }

  private createLayers(environment: string, repoRoot: string): Map<string, lambda.LayerVersion> {
    const layers = new Map<string, lambda.LayerVersion>();

    const layerConfigs: { name: LayerName; description: string }[] = [
      { name: 'nest', description: 'NestJS runtime and common utilities' },
      { name: 'auth', description: 'Authentication packages' },
      { name: 'aws', description: 'AWS SDK packages' },
    ];

    layerConfigs.forEach(({ name, description }) => {
      const layer = new lambda.LayerVersion(this, `${environment}-${this.stackName}-${name}-layer`, {
        code: lambda.Code.fromAsset(path.join(repoRoot, 'layers', name)),
        compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
        description: `${description} - ${environment}`,
        layerVersionName: `${environment}-${this.stackName}-${name}-layer`,
      });
      layers.set(name, layer);
    });

    return layers;
  }

  private createFunctions(
    environment: string,
    repoRoot: string,
    environmentVariables?: Record<string, string>
  ): Map<string, lambda.Function> {
    const functions = new Map<string, lambda.Function>();

    const functionNames = ['function-name'];
    const functionLayers: Record<string, LayerName[]> = {
      "function-name": ['nest', 'auth', 'aws'],
    };

    const layerExternalModules = [
      '@nestjs/common',
      '@nestjs/core',
      '@nestjs/platform-express',
      '@nestjs/jwt',
      '@nestjs/passport',
      '@nestjs/config',
      '@nestjs/throttler',
      '@prisma/client',
      '@vendia/serverless-express',
      'aws-lambda',
      'express',
      'rxjs',
      'zod',
      'nodemailer',
      'passport-google-oauth20',
      'google-auth-library',
      '@aws-sdk/client-sqs',
      '@aws-sdk/client-s3',
      '@aws-sdk/s3-request-presigner',
    ];

    const sharedAliases: Record<string, string> = {
      '@<project-name>/shared-utils': path.join(repoRoot, 'shared/utils/dist/index.js'),
      '@<project-name>/shared-types': path.join(repoRoot, 'shared/types/dist/index.js'),
      '@<project-name>/shared-constants': path.join(repoRoot, 'shared/constants/dist/index.js'),
      '@<project-name>/shared-services': path.join(repoRoot, 'shared/services/dist/src/index.js'),
    };
    const esbuildAliasArgs: Record<string, string> = {};
    for (const [from, to] of Object.entries(sharedAliases)) {
      esbuildAliasArgs[`--alias:${from}`] = to;
    }

    functionNames.forEach((functionName) => {
      const requiredLayers = (functionLayers[functionName] || ['nest'])
        .map((layerName) => this.layers.get(layerName)!)
        .filter((layer) => layer !== undefined);

      const lambdaFunction = new NodejsFunction(this, `${environment}-${this.stackName}-${functionName}-function`, {
        entry: path.join(repoRoot, `lambdas/${functionName}/dist/lambda.js`),
        handler: "handler",
        projectRoot: repoRoot,
        runtime: lambda.Runtime.NODEJS_20_X,
        functionName: `${environment}-${this.stackName}-${functionName}-function`,
        layers: requiredLayers,
        environment: (() => {
          const reserved = new Set(['AWS_REGION', 'AWS_DEFAULT_REGION', 'AWS_EXECUTION_ENV']);
          const filtered = environmentVariables
            ? Object.fromEntries(
                Object.entries(environmentVariables).filter(([k]) => !reserved.has(k))
              )
            : {};
          return {
            ENVIRONMENT: environment,
            DEPLOYMENT_ENV: environment,
            NODE_ENV: environment === 'prod' ? 'production' : 'development',
            ...filtered,
          };
        })(),
        timeout: cdk.Duration.seconds(30),
        memorySize: 256,
        bundling: {
          externalModules: layerExternalModules,
          nodeModules: ['@prisma/client'],
          format: OutputFormat.CJS,
          sourceMap: false,
          minify: environment === 'prod',
          target: 'node20',
          keepNames: true,
          esbuildArgs: esbuildAliasArgs,
          commandHooks: {
            beforeBundling(inputDir: string, outputDir: string): string[] {
              // Build shared packages first (preserves their decorator metadata)
              const sharedTypesPath = path.join(repoRoot, 'shared', 'types');
              const sharedConstantsPath = path.join(repoRoot, 'shared', 'constants');
              const sharedUtilsPath = path.join(repoRoot, 'shared', 'utils');
              const sharedServicesPath = path.join(repoRoot, 'shared', 'services');
              
              return [
                // Build shared packages first to preserve decorator metadata
                `cd ${sharedTypesPath} && npx tsc`,
                `cd ${sharedConstantsPath} && npx tsc`,
                `cd ${sharedUtilsPath} && npx tsc`,
                `cd ${sharedServicesPath} && npx tsc`,
                // Then compile the lambda (preserves decorator metadata)
                `cd ${path.join(repoRoot, `lambdas/${functionName}`)} && npx tsc --project ${path.join(repoRoot, `lambdas/${functionName}/tsconfig.json`)}`,
              ];
            },
            beforeInstall(): string[] {
              return [];
            },
            afterBundling(inputDir: string, outputDir: string): string[] {
              return [];
            },
          },
        },
      });

      functions.set(functionName, lambdaFunction);
    });

    return functions;
  }

  private attachToApi(api: apigateway.RestApi): void {
    const apiResource = api.root.addResource('api');
    this.functions.forEach((lambdaFunction, functionName) => {
      const integration = new apigateway.LambdaIntegration(lambdaFunction, {
        requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
      });
      const resource = apiResource.addResource(functionName);
      resource.addMethod('ANY', integration);
      resource.addResource('{proxy+}').addMethod('ANY', integration);
    });
  }
}
