import { ApiHelper } from "@src/api/helper";
import { AccountJobApiDto } from "@src/models/api/account-job";
import { GetAccountJobsPaginatedRequestDto } from "@src/models/api/get-account-jobs-paginated-request";
import { PaginatedResponseDto } from "@src/models/api/paginated-response";
import { AccountDao } from "@src/models/classes/dao/account";
import { AccountJobDao } from "@src/models/classes/dao/account-job";
import { GetAccountJobSchedulesPaginationParams } from "@src/modules/account-jobs-schedules/service";
import { AccountJobService, GetAccountJobsPaginationParams } from "@src/modules/account-jobs/service";
import { JobHelper } from "@src/modules/job/helper";
import { MAX_NUMBER, MIN_NUMBER, SortOrder } from "@src/modules/pagination/constants";
import { PaginationService } from "@src/modules/pagination/service";
import { AuthenticationContext, RouteHandler } from "@src/router/types";
import { requireNonNull } from "@src/util/common";

export class GetAllAccountJobsPaginatedHandler implements RouteHandler<GetAccountJobsPaginatedRequestDto, PaginatedResponseDto<AccountJobApiDto>> {

    private readonly accountJobService: AccountJobService;
    private readonly apiHelper: ApiHelper;
    private readonly jobHelper: JobHelper;
    private readonly paginationService: PaginationService;

    constructor(
        accountJobService: AccountJobService, 
        apiHelper: ApiHelper,
        jobHelper: JobHelper,
        paginationService: PaginationService
    ) {
        this.accountJobService = requireNonNull(accountJobService);
        this.apiHelper = requireNonNull(apiHelper);
        this.jobHelper = requireNonNull(jobHelper);
        this.paginationService = requireNonNull(paginationService);
    }

    public async handle(context: AuthenticationContext, dto: GetAccountJobsPaginatedRequestDto): Promise<PaginatedResponseDto<AccountJobApiDto>> {
        const accountId = (context.account as AccountDao).id;
        this.paginationService.validateQueryParams(dto);
        const paginationParams = this.getPaginationParams(dto);

        const accountJobDaos = await this.accountJobService.getByAccountIdPaginated(accountId, paginationParams);
        const nextPageKey = this.buildNextPageKey(accountJobDaos, paginationParams);

        const convertedApiItems: AccountJobApiDto[] = [];
        for (const accountJobDao of accountJobDaos) {
            const accountJobDetails = await this.jobHelper.getAccountJobDetails(accountJobDao.id);
            if (accountJobDetails !== null) {
                convertedApiItems.push(this.apiHelper.convertAccountJobApiDto(accountJobDetails) as AccountJobApiDto);
            }
        }

        return {
            items: convertedApiItems,
            nextPageKey,
        }
    }

    private getPaginationParams(dto: GetAccountJobsPaginatedRequestDto): GetAccountJobsPaginationParams {
        if (!dto.nextPageKey) {
            const order: SortOrder = dto.order === SortOrder.ASCENDING ? SortOrder.ASCENDING : SortOrder.DESCENDING;
            const limit: number = dto.limit || 50;
            const lastSeen: number = order === SortOrder.ASCENDING ? MIN_NUMBER : MAX_NUMBER;

            return {
                order,
                limit,
                lastSeen,
            };
        }

        return this.paginationService.decode<GetAccountJobSchedulesPaginationParams>(dto.nextPageKey);
    }

    private buildNextPageKey(items: AccountJobDao[], oldParams: GetAccountJobsPaginationParams): string | undefined {
        if (items.length < oldParams.limit) {
            return;
        }

        const newParams: GetAccountJobsPaginationParams = {
            limit: oldParams.limit,
            order: oldParams.order,
            lastSeen: this.paginationService.getLastElement(items).id,
        };

        return this.paginationService.encode(newParams);
    }

}