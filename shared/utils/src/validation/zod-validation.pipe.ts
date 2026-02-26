import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { z } from "zod";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
    constructor(private readonly schema: z.ZodType) {}

    transform(value: unknown) {
        const result = this.schema.safeParse(value);
        if (!result.success) {
            const issues = result.error.issues.map((i) => ({
                path: i.path.join("."),
                message: i.message,
            }));
            throw new BadRequestException(issues);
        }
        return result.data;
    }
}

