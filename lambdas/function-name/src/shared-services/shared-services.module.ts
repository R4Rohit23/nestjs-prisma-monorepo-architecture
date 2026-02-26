import { Global, Module } from "@nestjs/common";
import {
    NodemailerService,
    PasswordService,
    PrismaService,
} from "@project-name/shared-services";

@Global()
@Module({
    providers: [PrismaService, PasswordService, NodemailerService],
    exports: [PrismaService, PasswordService, NodemailerService],
})
export class SharedServicesModule {}
