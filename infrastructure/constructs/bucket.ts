import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface MediaBucketProps {
  /**
   * The name of the bucket
   * Note: S3 bucket names must be globally unique across all AWS accounts.
   * Consider including account ID, region, or environment in the name.
   */
  bucketName: string;
  
  /**
   * The environment (dev, prod, etc.)
   */
  environment: string;
  
  /**
   * Whether to enable versioning
   * @default false
   */
  versioned?: boolean;
  
  /**
   * Whether to enable public read access
   * @default false
   */
  publicReadAccess?: boolean;
  
  /**
   * Whether to block public access
   * @default true
   */
  blockPublicAccess?: boolean;
  
  /**
   * Lifecycle rules for the bucket
   * @default undefined
   */
  lifecycleRules?: s3.LifecycleRule[];
  
  /**
   * CORS configuration
   * @default undefined
   */
  cors?: s3.CorsRule[];
  
  /**
   * Whether to enable encryption
   * @default true
   */
  encryption?: boolean;
  
  /**
   * Lambda functions that should have read/write access to this bucket
   */
  lambdaFunctions?: cdk.aws_lambda.Function[];
}

export class MediaBucket extends Construct {
  public readonly bucket: s3.Bucket;
  public readonly bucketName: string;

  constructor(scope: Construct, id: string, props: MediaBucketProps) {
    super(scope, id);

    const {
      bucketName,
      environment,
      versioned = false,
      publicReadAccess = false,
      blockPublicAccess = true,
      lifecycleRules,
      cors,
      encryption = true,
      lambdaFunctions = [],
    } = props;

    // Default CORS configuration if not provided
    const defaultCors: s3.CorsRule[] = cors || [
      {
        allowedOrigins: ['*'],
        allowedMethods: [
          s3.HttpMethods.GET,
          s3.HttpMethods.PUT,
          s3.HttpMethods.POST,
          s3.HttpMethods.DELETE,
          s3.HttpMethods.HEAD,
        ],
        allowedHeaders: ['*'],
        exposedHeaders: ['ETag'],
        maxAge: 3000,
      },
    ];

    // Create the S3 bucket
    this.bucket = new s3.Bucket(this, 'MediaBucket', {
      bucketName: bucketName,
      versioned: versioned,
      publicReadAccess: publicReadAccess,
      blockPublicAccess: blockPublicAccess
        ? s3.BlockPublicAccess.BLOCK_ALL
        : undefined,
      encryption: encryption
        ? s3.BucketEncryption.S3_MANAGED
        : undefined,
      cors: defaultCors,
      lifecycleRules: lifecycleRules,
      removalPolicy:
        environment === 'prod'
          ? cdk.RemovalPolicy.RETAIN
          : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: environment !== 'prod',
      enforceSSL: true, // Require SSL for all requests
    });

    this.bucketName = this.bucket.bucketName;

    // Grant permissions to Lambda functions
    if (lambdaFunctions.length > 0) {
      lambdaFunctions.forEach((lambdaFunction) => {
        // Grant read/write permissions
        this.bucket.grantReadWrite(lambdaFunction);
      });
    }

    // Output the bucket name
    new cdk.CfnOutput(this, 'BucketName', {
      value: this.bucket.bucketName,
      description: 'S3 Media Bucket Name',
      exportName: `MediaBucketName-${environment}`,
    });

    // Output the bucket ARN
    new cdk.CfnOutput(this, 'BucketArn', {
      value: this.bucket.bucketArn,
      description: 'S3 Media Bucket ARN',
      exportName: `MediaBucketArn-${environment}`,
    });
  }

  /**
   * Grant read access to a Lambda function
   */
  public grantRead(lambdaFunction: cdk.aws_lambda.Function): void {
    this.bucket.grantRead(lambdaFunction);
  }

  /**
   * Grant write access to a Lambda function
   */
  public grantWrite(lambdaFunction: cdk.aws_lambda.Function): void {
    this.bucket.grantWrite(lambdaFunction);
  }

  /**
   * Grant read/write access to a Lambda function
   */
  public grantReadWrite(lambdaFunction: cdk.aws_lambda.Function): void {
    this.bucket.grantReadWrite(lambdaFunction);
  }

  /**
   * Add a lifecycle rule to the bucket
   */
  public addLifecycleRule(rule: s3.LifecycleRule): void {
    this.bucket.addLifecycleRule(rule);
  }
}
