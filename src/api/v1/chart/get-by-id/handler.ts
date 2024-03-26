import { IllegalStateError } from "@src/api/error/illegal-state-error";
import { AccountChartDetailsApiDto } from "@src/models/api/account-chart-details";
import { GetAccountChartDetailsRequestDto } from "@src/models/api/get-account-chart-details-request";
import { AccountDao } from "@src/models/classes/dao/account";
import { ChartService } from "@src/modules/chart/service";
import { AuthenticationContext, RouteHandler } from "@src/router/types";
import { requireNonNull } from "@src/util/common";

export class GetAccountChartDetailsHandler implements RouteHandler<GetAccountChartDetailsRequestDto, AccountChartDetailsApiDto<unknown>> {

    static readonly ERROR_CHART_NOT_FOUND = "No chart with this ID exists";

    private readonly chartService: ChartService;
    
    constructor(chartService: ChartService) {
        this.chartService = requireNonNull(chartService);
    }

    public async handle(context: AuthenticationContext, dto: GetAccountChartDetailsRequestDto): Promise<AccountChartDetailsApiDto<unknown>> {
        const accountId = (context.account as AccountDao).id;

        // TODO check permission

        const details = await this.chartService.loadAccountChartDetails(dto.chartId);
        if (details === null) {
            throw new IllegalStateError("Something went wrong whiile fetching the chart details");
        }

        return details;
    }

}