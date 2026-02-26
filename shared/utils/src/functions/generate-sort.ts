import { ReqBody } from "../dto/request";

type SortItem = NonNullable<ReqBody["sort"]>[number];

// Generic JSON object type compatible with Prisma
type JsonObject = Record<string, any>;

export const generatePrismaSort = (sort?: SortItem[]): JsonObject | JsonObject[] | undefined => {
    console.log("[generatePrismaSort] : generating Prisma sort object");

    if (!sort || sort.length === 0) {
        console.log("[generatePrismaSort] : no sort provided, returning undefined");
        console.log("[generatePrismaSort] : execution finished");
        return undefined;
    }

    // Convert order number to Prisma sort direction
    // order > 0 = ascending, order < 0 = descending, order === 0 = ascending (default)
    const convertOrderToDirection = (order: number): "asc" | "desc" => {
        return order >= 0 ? "asc" : "desc";
    };

    const sortArray: JsonObject[] = sort.map((item) => {
        const direction = convertOrderToDirection(item.order);
        return {
            [item.orderBy]: direction,
        } as JsonObject;
    });

    const result = sortArray.length === 1 ? sortArray[0] : sortArray;

    console.log(`[generatePrismaSort] : generated sort object : ${JSON.stringify(result)}`);
    console.log("[generatePrismaSort] : execution finished");

    return result;
};
