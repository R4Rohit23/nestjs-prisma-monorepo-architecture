import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { Logger } from "@nestjs/common";

@Injectable()
export class PasswordService {
    private readonly logger = new Logger(PasswordService.name);
    private readonly saltRounds = 10;

    /**
     * Hash a plain text password
     * @param password - Plain text password to hash
     * @returns Hashed password
     */
    async hashPassword(password: string): Promise<string> {
        this.logger.log("[hashPassword] : Starting password hashing");
        try {
            const hashedPassword = await bcrypt.hash(password, this.saltRounds);
            this.logger.log("[hashPassword] : Password hashed successfully");
            return hashedPassword;
        } catch (error) {
            this.logger.error("[hashPassword] : Error hashing password", error);
            throw error;
        } finally {
            this.logger.log("[hashPassword] : execution finished");
        }
    }

    /**
     * Compare a plain text password with a hashed password
     * @param plainPassword - Plain text password to compare
     * @param hashedPassword - Hashed password to compare against
     * @returns True if passwords match, false otherwise
     */
    async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        this.logger.log("[comparePassword] : Starting password comparison");
        try {
            const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
            this.logger.log(`[comparePassword] : Password comparison ${isMatch ? "successful" : "failed"}`);
            return isMatch;
        } catch (error) {
            this.logger.error("[comparePassword] : Error comparing passwords", error);
            throw error;
        } finally {
            this.logger.log("[comparePassword] : execution finished");
        }
    }
}
