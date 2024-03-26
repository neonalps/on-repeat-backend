import { AccountChartDetailsApiDto } from "@src/models/api/account-chart-details";
import { PutAccountChartRequestDto } from "@src/models/api/put-account-chart-request";
import { AccountDao } from "@src/models/classes/dao/account";
import { ChartService } from "@src/modules/chart/service";
import { AuthenticationContext, RouteHandler } from "@src/router/types";
import { requireNonNull } from "@src/util/common";

export class PutAccountChartHandler implements RouteHandler<PutAccountChartRequestDto, AccountChartDetailsApiDto<unknown>> {

    private readonly chartService: ChartService;
    
    constructor(chartService: ChartService) {
        this.chartService = requireNonNull(chartService);
    }

    public async handle(context: AuthenticationContext, dto: PutAccountChartRequestDto): Promise<AccountChartDetailsApiDto<unknown>> {
        const accountId = (context.account as AccountDao).id;

        if (!(await this.chartService.checkAccountChartExists(accountId, dto.accountChartId))) {
            throw new Error(`No account chart with this ID exists for this account`);
        }

        const accountChartDetails = await this.chartService.updateAccountChart({
            accountChartId: dto.accountChartId,
            name: dto.name,
            type: dto.type,
            from: new Date(dto.from),
            to: new Date(dto.to),
            items: dto.items,
        });

        return accountChartDetails;
    }

}