import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        console.log("[RolesGuard] : Checking user roles");
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            // If no roles are required, allow access
            console.log("[RolesGuard] : No roles required, allowing access");
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            console.log("[RolesGuard] : No user found in request");
            throw new ForbiddenException("User not authenticated");
        }

        const userRole = user.role as string;

        if (!userRole) {
            console.log("[RolesGuard] : User role not found");
            throw new ForbiddenException("User role not found");
        }

        const hasRole = requiredRoles.some((role) => role === userRole);

        if (!hasRole) {
            console.log("[RolesGuard] : User does not have required role");
            throw new ForbiddenException("You do not have permission to access this resource");
        }

        console.log("[RolesGuard] : User has required role, allowing access");
        console.log("[RolesGuard] : execution finished");
        return true;
    }
}

