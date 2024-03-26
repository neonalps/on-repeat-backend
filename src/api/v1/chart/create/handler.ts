import { AccountChartDetailsApiDto } from "@src/models/api/account-chart-details";
import { CreateAccountChartRequestDto } from "@src/models/api/create-account-chart-request";
import { AccountDao } from "@src/models/classes/dao/account";
import { ChartService } from "@src/modules/chart/service";
import { AuthenticationContext, RouteHandler } from "@src/router/types";
import { requireNonNull } from "@src/util/common";

export class CreateAccountChartHandler implements RouteHandler<CreateAccountChartRequestDto, AccountChartDetailsApiDto<unknown>> {

    private readonly chartService: ChartService;
    
    constructor(chartService: ChartService) {
        this.chartService = requireNonNull(chartService);
    }

    public async handle(context: AuthenticationContext, dto: CreateAccountChartRequestDto): Promise<AccountChartDetailsApiDto<unknown>> {
        const accountId = (context.account as AccountDao).id;

        const accountChartDetails = await this.chartService.createAccountChart({
            accountId,
            name: dto.name,
            type: dto.type,
            from: dto.from,
            to: dto.to,
        });

        return accountChartDetails;
    }

}