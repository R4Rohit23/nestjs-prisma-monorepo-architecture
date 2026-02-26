import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export interface ApiGatewayProps {
  /**
   * The environment (dev, prod, etc.)
   */
  environment: string;

  /**
   * REST API name
   */
  restApiName?: string;

  /**
   * REST API description
   */
  description?: string;

  /**
   * Allowed CORS origins
   * @default apigateway.Cors.ALL_ORIGINS
   */
  allowOrigins?: string[];

  /**
   * Allowed CORS methods
   * @default apigateway.Cors.ALL_METHODS
   */
  allowMethods?: string[];

  /**
   * Allowed CORS headers
   * @default ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key']
   */
  allowHeaders?: string[];
}

export class ApiGateway extends Construct {
  public readonly api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: ApiGatewayProps) {
    super(scope, id);

    const {
      environment,
      restApiName = `<function-name> API - ${environment}`,
      description = `API Gateway for <function-name> backend - ${environment}`,
      allowOrigins = apigateway.Cors.ALL_ORIGINS,
      allowMethods = apigateway.Cors.ALL_METHODS,
      allowHeaders = ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key'],
    } = props;

    this.api = new apigateway.RestApi(this, '<function-name> API', {
      restApiName,
      description,
      deployOptions: {
        stageName: environment,
      },
      defaultCorsPreflightOptions: {
        allowOrigins,
        allowMethods,
        allowHeaders,
      },
    });

    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: this.api.url,
      description: 'API Gateway URL',
      exportName: `<function-name>ApiUrl-${environment}`,
    });
  }
}
