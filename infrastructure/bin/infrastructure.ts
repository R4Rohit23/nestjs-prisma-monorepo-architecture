#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Stack } from '../lib/stack';

const app = new cdk.App();

const environment = process.env.DEPLOYMENT_ENV || "dev";
const account = process.env.AWS_ACCOUNT_ID;
const region = process.env.AWS_REGION;

const STACK_ID = process.env.STACK_ID || "project-name";
const STACK_NAME = `${environment}-${STACK_ID}-stack`;
const BUCKET_NAME = `${environment}-${STACK_ID}-media`;

function collectLambdaEnvironmentVariables(): Record<string, string> {
  const envVars: Record<string, string> = {};

  // List of environment variables to pass to Lambda functions (do not include AWS_REGION – reserved by Lambda runtime)
  const lambdaEnvVarNames = [
    'DATABASE_URL',
    'JWT_SECRET',
    'SENDER_EMAIL',
    'SENDER_EMAIL_APP_PASSWORD',
  ];

  lambdaEnvVarNames.forEach((varName) => {
    const value = process.env[varName];
    if (value !== undefined && value !== null && value !== '') {
      envVars[varName] = value;
    }
  });

  return envVars;
}

const lambdaEnvironmentVariables = collectLambdaEnvironmentVariables();

new Stack(app, STACK_NAME, {
  env: {
    account,
    region,
  },
  environment,
  environmentVariables: {
    ...lambdaEnvironmentVariables,
    BUCKET_NAME,
    STACK_ID,
    STACK_NAME
  },
  description: `<project-name> Backend Infrastructure - ${environment}`,
});

app.synth();
