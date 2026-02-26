import { FiltersDto } from "../dto/request";

type FilterItem = FiltersDto[string] extends Array<infer T> ? T : never;
type FilterDataType = FilterItem["dataType"];

// Generic JSON object type compatible with Prisma
type JsonObject = Record<string, any>;

const SCALAR_OPERATIONS = ["eq", "ne", "gte", "lte", "lt", "gt"];
const ARRAY_OPERATIONS = ["in", "nin"];

// Map filter operations to Prisma where clause operators
const PRISMA_OPERATOR_MAP: Record<FilterItem["operation"], string> = {
    eq: "equals",
    ne: "not",
    gte: "gte",
    lte: "lte",
    gt: "gt",
    lt: "lt",
    in: "in",
    nin: "notIn",
};

export const generateValue = (
    defaultValue: FilterItem["value"],
    dataType: FilterDataType,
    operation: FilterItem["operation"]
) => {
    let value: any = null;

    // Validate value type matches operation requirements
    if (SCALAR_OPERATIONS.includes(operation) && typeof defaultValue !== "string" && typeof defaultValue !== "number")
        return null;
    if (ARRAY_OPERATIONS.includes(operation) && !Array.isArray(defaultValue)) return null;

    switch (dataType) {
        case "date":
            if (typeof defaultValue === "string" || typeof defaultValue === "number" || defaultValue instanceof Date) {
                const date = new Date(defaultValue as string | number);
                if (!isNaN(date.getTime())) value = date;
            }
            break;
        case "string":
            if (typeof defaultValue === "string") value = defaultValue;
            break;
        case "number":
            if (typeof defaultValue === "number") value = defaultValue;
            break;
        case "array":
            if (Array.isArray(defaultValue)) value = defaultValue.length > 0 ? defaultValue : null;
            break;
    }

    return value;
};

export const generatePrismaWhereFilter = (filters?: FiltersDto): JsonObject => {
    console.log("[generatePrismaWhereFilter] : generating Prisma where clause filters");

    if (!filters || Object.keys(filters).length === 0) {
        console.log("[generatePrismaWhereFilter] : no filters provided, returning empty object");
        return {};
    }

    const whereClause: JsonObject = {};
    const andConditions: JsonObject[] = [];

    Object.keys(filters).forEach((key) => {
        const operations = filters[key];
        const fieldConditions: JsonObject = {};
        let hasNotOperation = false;
        let notValue: any = null;

        for (let operation of operations) {
            // Validate correct operator
            const prismaOperator = PRISMA_OPERATOR_MAP[operation.operation];
            if (!prismaOperator) continue;

            // Generate value based on dataType and operation
            const value = generateValue(operation.value, operation.dataType, operation.operation);

            // Skip if value is invalid
            if (value === null && value !== false) continue;

            // Handle 'not' (ne) operator separately
            if (operation.operation === "ne") {
                hasNotOperation = true;
                notValue = value;
            } else {
                // For other operations, add to field conditions
                fieldConditions[prismaOperator] = value;
            }
        }

        // If we have both regular conditions and 'not' operation, use AND to combine them
        // because Prisma doesn't allow mixing equals with not in the same field object
        if (hasNotOperation && Object.keys(fieldConditions).length > 0) {
            // Add regular conditions as one AND condition
            andConditions.push({ [key]: fieldConditions } as JsonObject);
            // Add 'not' condition as another AND condition
            andConditions.push({ [key]: { not: notValue } } as JsonObject);
        } else if (hasNotOperation) {
            // Only 'not' operation
            whereClause[key] = { not: notValue };
        } else if (Object.keys(fieldConditions).length > 0) {
            // Only regular conditions, can combine them in one object
            whereClause[key] = fieldConditions;
        }
    });

    // If we have AND conditions, combine them with existing where clause
    if (andConditions.length > 0) {
        if (Object.keys(whereClause).length > 0) {
            // Combine existing conditions with AND conditions
            whereClause.AND = [
                ...Object.keys(whereClause).map((key) => ({ [key]: whereClause[key] }) as JsonObject),
                ...andConditions,
            ];
            // Remove individual field conditions as they're now in AND
            Object.keys(whereClause).forEach((key) => {
                if (key !== "AND") delete whereClause[key];
            });
        } else {
            whereClause.AND = andConditions;
        }
    }

    console.log(`[generatePrismaWhereFilter] : generated where clause : ${JSON.stringify(whereClause)}`);
    console.log("[generatePrismaWhereFilter] : execution finished");

    return whereClause;
};
