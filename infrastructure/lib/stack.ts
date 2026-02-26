import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';
import { ApiGateway } from '../constructs/api-gateway';
import { Lambda } from '../constructs/lambda';
import { MediaBucket } from '../constructs/bucket';

export interface StackProps extends cdk.StackProps {
  environment: string;
  environmentVariables?: Record<string, string>;
}

export class Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const { environment, environmentVariables } = props;
    const repoRoot = path.join(__dirname, '../..');

    const apiGateway = new ApiGateway(this, 'ApiGateway', {
      environment,
    });

    const lambdaConstruct = new Lambda(this, 'Lambda', {
      environment,
      repoRoot,
      api: apiGateway.api,
      environmentVariables,
    });

    const bucketName =
      environmentVariables?.BUCKET_NAME || `${environment}-project-name-media`;
    const mediaBucket = new MediaBucket(this, 'MediaBucket', {
      bucketName,
      environment,
      lambdaFunctions: Array.from(lambdaConstruct.functions.values()),
    });

    new cdk.CfnOutput(this, 'MediaBucketUrl', {
      value: `s3://${mediaBucket.bucketName}`,
      description: 'S3 Media Bucket URL',
      exportName: `MediaBucketUrl-${environment}`,
    });
  }
}
