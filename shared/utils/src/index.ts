// Shared utility functions and classes for @project-name/shared-utils

// ============= Decorators =============
export * from './decorators/current-user.decorator';
export * from './decorators/public.decorator';
export * from './decorators/roles.decorator';

// ============= DTOs =============
export * from './dto/request';
export * from './dto/response';

// ============= Exceptions =============
export * from './exceptions/custom.exception';

// ============= Filters =============
export * from './filters/global-exception.filter';

// ============= Functions =============
export * from './functions/generate-filters';
export * from './functions/generate-password';
export * from './functions/generate-sort';

// ============= Guards =============
export * from './guards/auth.guard';
export * from './guards/roles.guard';

// ============= Validation =============
export * from './validation/zod-validation.pipe';

// ============= Simple Utilities =============
export const logger = {
    info: (message: string, ...args: any[]) => {
        console.log(`[INFO] ${message}`, ...args);
    },
    error: (message: string, ...args: any[]) => {
        console.error(`[ERROR] ${message}`, ...args);
    },
    warn: (message: string, ...args: any[]) => {
        console.warn(`[WARN] ${message}`, ...args);
    },
    debug: (message: string, ...args: any[]) => {
        console.debug(`[DEBUG] ${message}`, ...args);
    },
};

export const formatDate = (date: Date): string => {
    return date.toISOString();
};

export const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
