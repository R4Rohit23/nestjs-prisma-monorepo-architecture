import { SQSClient, SendMessageCommand, SendMessageBatchCommand } from '@aws-sdk/client-sqs';

export interface SQSMessage {
    id: string;
    type: string;
    data: any;
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    timestamp: string;
    retryCount?: number;
}

export interface QueueConfig {
    emailNotifications: string;
}

export class SQSService {
    private static instance: SQSService;
    private sqsClient: SQSClient;
    private queueUrls: QueueConfig;
    private messageCache: Map<string, any> = new Map();
    private batchBuffer: Map<string, any[]> = new Map();
    private batchTimer: NodeJS.Timeout | null = null;
    private readonly BATCH_SIZE = 10;
    private readonly BATCH_DELAY = 1000; // 1 second

    private constructor() {
        console.log("[SQSService] : Initializing SQS service");
        
        this.sqsClient = new SQSClient({
            region: process.env.AWS_REGION || 'us-east-1',
            maxAttempts: 3,
            retryMode: 'adaptive',
        });

        this.queueUrls = {
            emailNotifications: process.env.EMAIL_NOTIFICATIONS_QUEUE_URL || '',
        };

        console.log("[SQSService] : SQS service initialized");
    }

    public static getInstance(): SQSService {
        if (!SQSService.instance) {
            SQSService.instance = new SQSService();
        }
        return SQSService.instance;
    }

    /**
     * Send a single message to a specific queue with deduplication
     */
    async sendMessage(queueName: keyof QueueConfig, messageData: any, priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM'): Promise<void> {
        console.log(`[SQSService] : Sending message to ${queueName} queue`);
        
        try {
            // Create message hash for deduplication
            const messageHash = this.createMessageHash(messageData);
            
            // Check if message already exists in cache (deduplication)
            if (this.messageCache.has(messageHash)) {
                console.log(`[SQSService] : Duplicate message detected, skipping: ${messageHash}`);
                return;
            }

            const message: SQSMessage = {
                id: crypto.randomUUID(),
                type: messageData.type || 'GENERIC',
                data: messageData,
                priority,
                timestamp: new Date().toISOString(),
                retryCount: 0,
            };

            // Add to cache for deduplication
            this.messageCache.set(messageHash, message);
            
            // Clean old cache entries (keep last 1000)
            if (this.messageCache.size > 1000) {
                const firstKey = this.messageCache.keys().next().value;
                if (firstKey) {
                    this.messageCache.delete(firstKey);
                }
            }

            const queueUrl = this.queueUrls[queueName];
            if (!queueUrl) {
                throw new Error(`Queue URL not configured for ${queueName}`);
            }

            // For high priority messages, send immediately
            if (priority === 'HIGH') {
                await this.sendImmediate(queueUrl, message, priority);
            } else {
                // For medium/low priority, use batching
                await this.addToBatch(queueName, message, priority);
            }

            console.log(`[SQSService] : Message queued successfully to ${queueName} queue`);
        } catch (error) {
            console.error(`[SQSService] : Failed to send message to ${queueName} queue:`, error);
            throw error;
        } finally {
            console.log(`[SQSService] : execution finished`);
        }
    }

    private createMessageHash(messageData: any): string {
        const content = JSON.stringify({
            type: messageData.type,
            data: messageData.data || messageData,
        });
        return Buffer.from(content).toString('base64').slice(0, 32);
    }

    private async sendImmediate(queueUrl: string, message: SQSMessage, priority: string): Promise<void> {
        const command = new SendMessageCommand({
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify(message),
            MessageAttributes: {
                Priority: {
                    DataType: 'String',
                    StringValue: priority,
                },
                MessageType: {
                    DataType: 'String',
                    StringValue: message.type,
                },
            },
        });

        await this.sqsClient.send(command);
    }

    private async addToBatch(queueName: keyof QueueConfig, message: SQSMessage, priority: string): Promise<void> {
        if (!this.batchBuffer.has(queueName)) {
            this.batchBuffer.set(queueName, []);
        }

        this.batchBuffer.get(queueName)!.push({ message, priority });

        // If batch is full, send immediately
        if (this.batchBuffer.get(queueName)!.length >= this.BATCH_SIZE) {
            await this.flushBatch(queueName);
        } else {
            // Set timer to flush batch after delay
            if (!this.batchTimer) {
                this.batchTimer = setTimeout(() => {
                    this.flushAllBatches();
                }, this.BATCH_DELAY);
            }
        }
    }

    private async flushBatch(queueName: keyof QueueConfig): Promise<void> {
        const batch = this.batchBuffer.get(queueName);
        if (!batch || batch.length === 0) return;

        const queueUrl = this.queueUrls[queueName];
        if (!queueUrl) return;

        try {
            const entries = batch.map(({ message, priority }, index) => ({
                Id: `${message.id}-${index}`,
                MessageBody: JSON.stringify(message),
                MessageAttributes: {
                    Priority: {
                        DataType: 'String',
                        StringValue: priority,
                    },
                    MessageType: {
                        DataType: 'String',
                        StringValue: message.type,
                    },
                },
            }));

            const command = new SendMessageBatchCommand({
                QueueUrl: queueUrl,
                Entries: entries,
            });

            await this.sqsClient.send(command);
            console.log(`[SQSService] : Batch of ${batch.length} messages sent to ${queueName}`);
            
            // Clear the batch
            this.batchBuffer.set(queueName, []);
        } catch (error) {
            console.error(`[SQSService] : Failed to send batch to ${queueName}:`, error);
            throw error;
        }
    }

    private async flushAllBatches(): Promise<void> {
        const queueNames = Array.from(this.batchBuffer.keys()) as (keyof QueueConfig)[];
        const promises = queueNames.map(queueName => 
            this.flushBatch(queueName)
        );
        
        await Promise.allSettled(promises);
        
        if (this.batchTimer) {
            clearTimeout(this.batchTimer);
            this.batchTimer = null;
        }
    }

    /**
     * Send email notification message
     */
    async sendEmailNotification(emailData: {
        type: 'OTP_EMAIL' | 'WELCOME_EMAIL' | 'PASSWORD_RESET' | 'NOTIFICATION_EMAIL';
        email: string;
        subject: string;
        html: string;
        text?: string;
        priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    }): Promise<void> {
        console.log(`[SQSService] : Sending email notification for ${emailData.type}`);
        
        await this.sendMessage('emailNotifications', emailData, emailData.priority || 'HIGH');
    }
}

export const sqsService = SQSService.getInstance();
