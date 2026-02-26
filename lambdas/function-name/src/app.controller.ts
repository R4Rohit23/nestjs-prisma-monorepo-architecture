import { Controller, Get } from "@nestjs/common";
import { Public } from "@project-name/shared-utils";
import { AppService } from "./app.service";

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Public()
    @Get("health")
    getHealth() {
        return {
            status: "ok",
            timestamp: new Date().toISOString(),
            environment: process.env.DEPLOYMENT_ENV || "development",
            service: "<function-name>",
        };
    }

}
