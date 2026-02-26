import { Injectable, OnModuleInit, Global, INestApplication, OnModuleDestroy, Logger } from "@nestjs/common";
import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { ConfigService } from "@nestjs/config";

@Global()
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);
    private pool: Pool;

    constructor(private configService?: ConfigService) {
        console.log("[PrismaService.constructor] : initializing Prisma service with pg adapter");
        
        const databaseUrl = configService?.get<string>("DATABASE_URL") || process.env.DATABASE_URL;
        if (!databaseUrl) {
            throw new Error("DATABASE_URL is not configured for Prisma");
        }

        // Create pg Pool for the adapter
        const pool = new Pool({ connectionString: databaseUrl });
        const adapter = new PrismaPg(pool);

        super({
            adapter,
            log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
        });

        this.pool = pool;
        this.logger.log("[PrismaService.constructor] : initializing Prisma service");
        this.logger.log(`[PrismaService.constructor] : DATABASE_URL loaded`);
        this.logger.log("[PrismaService.constructor] : execution finished");
    }

    async onModuleInit() {
        this.logger.log("[PrismaService.onModuleInit] : starting database connection");
        try {
            await this.$connect();
            this.logger.log("[PrismaService.onModuleInit] : connected successfully");
            this.logger.log("[PrismaService.onModuleInit] : execution finished");
        } catch (error) {
            this.logger.error("[PrismaService.onModuleInit] : connection failed", error instanceof Error ? error.stack : String(error));
            throw error;
        }
    }

    async onModuleDestroy() {
        this.logger.log("[PrismaService.onModuleDestroy] : disconnecting database");
        await this.$disconnect();
        await this.pool.end();
        this.logger.log("[PrismaService.onModuleDestroy] : execution finished");
    }

    async enableShutdownHooks(app: INestApplication) {
        this.logger.log("[PrismaService.enableShutdownHooks] : setting shutdown hook");
        process.on("beforeExit", async () => {
            await app.close();
        });
        this.logger.log("[PrismaService.enableShutdownHooks] : execution finished");
    }
}

