import { AccountJobApiDto } from "@src/models/api/account-job";
import { AccountTokenApiDto } from "@src/models/api/account-token";
import { PaginatedResponseDto } from "./paginated-response";
import { PlayedInfoApiDto } from "./played-info";

export interface ProfileInfoApiDto {
    accountJobs: PaginatedResponseDto<AccountJobApiDto>,
    accountTokens: PaginatedResponseDto<AccountTokenApiDto>,
    playedInfo: PlayedInfoApiDto,
}