import { z } from "zod";

const filterOperationEnum = z.enum(["eq", "ne", "gte", "lte", "gt", "lt", "in", "nin"]);

const filterItemSchema = z
    .object({
        operation: filterOperationEnum,
        value: z.union([z.string(), z.number(), z.array(z.any())]),
        dataType: z.enum(["date", "string", "number", "array"]),
    })
    .strict();

export const FiltersDto = z.record(z.string(), z.array(filterItemSchema));

export const ReqBodySchema = z.object({
    search: z.string().optional(),
    filters: FiltersDto.optional(),
    page: z.number().optional(),
    limit: z.number().optional(),
    sort: z.array(z.object({ order: z.number(), orderBy: z.string() })).optional(),
});

export const ReqQuerySchema = z.object({
    search: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
});

export type FiltersDto = z.infer<typeof FiltersDto>;
export type ReqBody = z.infer<typeof ReqBodySchema>;
export type ReqQuery = z.infer<typeof ReqQuerySchema>;
