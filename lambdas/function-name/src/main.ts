import { config } from "dotenv";
import { join } from "path";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { GlobalExceptionFilter } from "@project-name/shared-utils";

// Load root .env first so DATABASE_URL etc. are available before any provider (e.g. PrismaService) initializes
config({ path: join(process.cwd(), "..", "..", ".env") });

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Register global exception filter
    app.useGlobalFilters(new GlobalExceptionFilter());

    // Enable CORS - redploying
    app.enableCors();

    // Set global prefix for all routes
    app.setGlobalPrefix('api/function-name');

    await app.listen(process.env.PORT ?? 3000);

    console.log(`Server is running on port ${process.env.PORT ?? 3000}`);
}
bootstrap();
