import sql from "@src/db/db";

export enum SortOrder {
    ASCENDING = "asc",
    DESCENDING = "desc",
};

export interface PaginationParams<T> {
    lastSeen: T;
    limit: number;
    order: SortOrder;
}

export interface PaginationQueryParams {
    nextPageKey?: string;
    limit?: number;
    order?: SortOrder;
}

export const PAGINATED_REQUEST_QUERYSTRING_SCHEMA_PROPERTIES = {
    limit: { type: 'number' },
    order: { type: 'string', enum: [ SortOrder.ASCENDING, SortOrder.DESCENDING ] },
    nextPageKey: { type: 'string' },
};

export const MIN_DATE = new Date("1950-01-01T00:00:00.000Z");
export const MAX_DATE = new Date("2099-12-31T23:59:59.999Z");
export const MIN_NUMBER = 0;
export const MAX_NUMBER = 2147483627;

export function determineSortComparison(order: SortOrder) {
    return order === SortOrder.DESCENDING ? sql`<` : sql`>`;
}

export function determineSortOrder(order: SortOrder) {
    return order === SortOrder.DESCENDING ? sql`desc` : sql`asc`;
}