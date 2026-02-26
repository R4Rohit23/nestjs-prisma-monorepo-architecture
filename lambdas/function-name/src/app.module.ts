import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD, Reflector } from "@nestjs/core";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AuthGuard } from "@project-name/shared-utils";
import { join } from "path";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { SharedServicesModule } from "./shared-services/shared-services.module";

// Load .env from repo root when running locally (cwd is lambdas/authentication)
const rootEnv = join(process.cwd(), "..", "..", ".env");

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: [rootEnv, ".env"],
        }),
        SharedServicesModule,
        JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET,
        }),
        PassportModule.register({ defaultStrategy: "jwt" }),
        ThrottlerModule.forRoot({
            throttlers: [
                {
                    ttl: 60000, // the time to live in milliseconds
                    limit: 10, // the maximum number of requests within the ttl
                },
            ],
        }),
    ],
    controllers: [AppController],
    providers: [
        AppService,
        Reflector,
        {
            provide: APP_GUARD,
            useFactory: (reflector: Reflector, jwtService: JwtService) => {
                return new AuthGuard(jwtService, reflector);
            },
            inject: [Reflector, JwtService],
        },
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})

export class AppModule { }
