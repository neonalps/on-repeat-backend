import { PaginationQueryParams } from "@src/modules/pagination/constants";

export interface GetPlayedTracksPaginatedRequestDto extends PaginationQueryParams {
    from: Date;
    to: Date;
}