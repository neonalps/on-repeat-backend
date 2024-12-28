import { PaginationQueryParams } from "@src/modules/pagination/constants";

export interface GetAccountJobsPaginatedRequestDto extends PaginationQueryParams {
    state?: string;
}