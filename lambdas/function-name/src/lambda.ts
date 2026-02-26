import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { GlobalExceptionFilter } from "@project-name/shared-utils";
import { Handler, Context, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ExpressAdapter } from "@nestjs/platform-express";
import express from "express";
import { configure as serverlessExpress } from "@vendia/serverless-express";

let cachedHandler: Handler;

async function bootstrap() {
    const expressApp = express();

    expressApp.set("etag", false);
    expressApp.use(express.json());
    expressApp.use(express.urlencoded({ extended: true }));

    const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

    // Register global exception filter
    nestApp.useGlobalFilters(new GlobalExceptionFilter());

    // Enable CORS
    nestApp.enableCors({ origin: "*" });

    await nestApp.init();

    const app = nestApp.getHttpAdapter().getInstance();

    return serverlessExpress({ app });
}

export const handler: Handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    try {
        if (!cachedHandler) {
            cachedHandler = await bootstrap();
        }

        // Set context callbackWaitsForEmptyEventLoop to false for better performance
        context.callbackWaitsForEmptyEventLoop = false;

        return await cachedHandler(event, context, () => {});
    } catch (error: any) {
        console.error("Lambda handler error:", error);

        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
                "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
            },
            body: JSON.stringify({
                message: "Internal server error",
                error: process.env.NODE_ENV === "development" ? error?.message : "Something went wrong",
            }),
        };
    }
};
