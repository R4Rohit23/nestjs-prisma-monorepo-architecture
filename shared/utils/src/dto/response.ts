import { z } from "zod";

export const ResponseDto = z.object({
    success: z.boolean(),
    message: z.string(),
    data: z.any().optional(),
    pagination: z
        .object({
            page: z.number(),
            limit: z.number(),
            totalCount: z.number(),
            totalPages: z.number(),
        })
        .optional(),
});

export type ResponseDto = z.infer<typeof ResponseDto>;

