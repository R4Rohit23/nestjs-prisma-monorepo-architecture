import { Global, Injectable } from "@nestjs/common";
import nodemailer from "nodemailer";
import { ConfigService } from "@nestjs/config";

@Global()
@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter | null = null;

    constructor(private configService?: ConfigService) {
        const senderEmail = configService?.get<string>("SENDER_EMAIL") || process.env.SENDER_EMAIL;
        const senderPassword = configService?.get<string>("SENDER_EMAIL_APP_PASSWORD") || process.env.SENDER_EMAIL_APP_PASSWORD;

        if (!senderEmail || !senderPassword) {
            console.warn(
                "[EmailService] : Email credentials not configured. Email functionality will be disabled."
            );
            return;
        }

        this.transporter = nodemailer.createTransport({
            service: "Gmail",
            secure: true,
            auth: {
                user: senderEmail,
                pass: senderPassword,
            },
        });

        console.log("[EmailService] : Email service initialized");
    }

    async sendMail(to: string, subject: string, html: string, text?: string): Promise<void> {
        if (!this.transporter) {
            throw new Error(
                "Email service not configured. Please set SENDER_EMAIL and SENDER_EMAIL_APP_PASSWORD environment variables."
            );
        }

        const senderEmail = this.configService?.get<string>("SENDER_EMAIL") || process.env.SENDER_EMAIL;

        return new Promise((resolve, reject) => {
            const mailOptions: nodemailer.SendMailOptions = {
                from: senderEmail,
                to,
                subject,
                html,
                text,
            };

            this.transporter!.sendMail(mailOptions, (error: any, info: any) => {
                if (error) {
                    console.error("[EmailService] : Error sending email:", error);
                    reject(error);
                } else {
                    console.log("[EmailService] : Email sent successfully:", info.response);
                    resolve();
                }
            });
        });
    }

    /**
     * Send OTP email
     */
    async sendOTPEmail(to: string, otp: string): Promise<void> {
        const subject = "Your OTP Code";
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Your OTP Code</h2>
                <p>Your one-time password is:</p>
                <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                    ${otp}
                </div>
                <p>This code will expire in 5 minutes.</p>
                <p>If you didn't request this code, please ignore this email.</p>
            </div>
        `;
        await this.sendMail(to, subject, html);
    }

    /**
     * Send welcome email
     */
    async sendWelcomeEmail(to: string, name: string): Promise<void> {
        const subject = "Welcome to Nuboo!";
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Welcome ${name}!</h2>
                <p>Thank you for joining Nuboo. We're excited to have you on board!</p>
                <p>Get started by exploring our features and connecting with the community.</p>
            </div>
        `;
        await this.sendMail(to, subject, html);
    }

    /**
     * Send password reset email
     */
    async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
        const subject = "Password Reset Request";
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Password Reset Request</h2>
                <p>You requested to reset your password. Click the link below to reset it:</p>
                <div style="text-align: center; margin: 20px 0;">
                    <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                </div>
                <p>If you didn't request this, please ignore this email.</p>
                <p>This link will expire in 1 hour.</p>
            </div>
        `;
        await this.sendMail(to, subject, html);
    }
}

// Legacy export name for backward compatibility
export { EmailService as NodemailerService };

