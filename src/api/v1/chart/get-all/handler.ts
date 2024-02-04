import { ApiHelper } from "@src/api/helper";
import { AccountChartApiDto } from "@src/models/api/account-chart";
import { GetAccountChartsRequestDto } from "@src/models/api/get-account-charts-request";
import { PaginatedResponseDto } from "@src/models/api/paginated-response";
import { AccountDao } from "@src/models/classes/dao/account";
import { ChartService, GetAccountChartsPaginationParams } from "@src/modules/chart/service";
import { MAX_DATE, MIN_DATE, SortOrder } from "@src/modules/pagination/constants";
import { PaginationService } from "@src/modules/pagination/service";
import { AuthenticationContext, RouteHandler } from "@src/router/types";
import { requireNonNull } from "@src/util/common";

export class GetAccountChartsHandler implements RouteHandler<GetAccountChartsRequestDto, PaginatedResponseDto<AccountChartApiDto>> {

    private readonly apiHelper: ApiHelper;
    private readonly chartService: ChartService;
    private readonly paginationService: PaginationService;
    
    constructor(apiHelper: ApiHelper, chartService: ChartService, paginationService: PaginationService) {
        this.apiHelper = requireNonNull(apiHelper);
        this.chartService = requireNonNull(chartService);
        this.paginationService = requireNonNull(paginationService);
    }

    public async handle(context: AuthenticationContext, dto: GetAccountChartsRequestDto): Promise<PaginatedResponseDto<AccountChartApiDto>> {
        const accountId = (context.account as AccountDao).id;

        this.paginationService.validateQueryParams(dto);
        const paginationParams = this.getPaginationParams(dto);
        const charts = await this.chartService.getAccountChartsPaginated(accountId, paginationParams);
        const items = charts.map(item => this.apiHelper.convertAccountChartApiDto(item));

        return {
            nextPageKey: this.buildNextPageKey(items, paginationParams),
            items,
        }
    }

    private getPaginationParams(dto: GetAccountChartsRequestDto): GetAccountChartsPaginationParams {
        if (!dto.nextPageKey) {
            const order: SortOrder = dto.order === SortOrder.ASCENDING ? SortOrder.ASCENDING : SortOrder.DESCENDING;
            const limit: number = dto.limit || 50;
            const lastSeen: Date = order === SortOrder.ASCENDING ? MIN_DATE : MAX_DATE;

            return {
                order,
                limit,
                lastSeen,
            };
        }

        return this.paginationService.decode<GetAccountChartsPaginationParams>(dto.nextPageKey);
    }

    private buildNextPageKey(items: AccountChartApiDto[], oldParams: GetAccountChartsPaginationParams): string | undefined {
        if (items.length < oldParams.limit) {
            return;
        }

        const newParams: GetAccountChartsPaginationParams = {
            limit: oldParams.limit,
            order: oldParams.order,
            lastSeen: this.paginationService.getLastElement(items).from,
        };

        return this.paginationService.encode(newParams);
    }

}