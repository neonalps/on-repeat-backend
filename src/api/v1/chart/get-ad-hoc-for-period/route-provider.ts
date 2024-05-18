import { requireNonNull } from "@src/util/common";
import { RequestSchema, RouteDefinition, RouteProvider } from "@src/router/types";
import { CreateChartsForPeriodRequestDto } from "@src/models/api/create-charts-for-period-request";
import { ChartApiDto } from "@src/models/api/chart";
import { GetChartForPeriodHandler } from "@src/api/v1/chart/get-ad-hoc-for-period/handler";
import { CHART_TYPES } from "@src/modules/chart/constants";
import { AccountChartItemApiDto } from "@src/models/api/account-chart-item";

export class GetChartForPeriodRouteProvider implements RouteProvider<CreateChartsForPeriodRequestDto, ChartApiDto<AccountChartItemApiDto<unknown>>> {

    private readonly handler: GetChartForPeriodHandler;

    constructor(createChartForPeriodHandler: GetChartForPeriodHandler) {
        this.handler = requireNonNull(createChartForPeriodHandler);
    }

    provide(): RouteDefinition<CreateChartsForPeriodRequestDto, ChartApiDto<AccountChartItemApiDto<unknown>>> {
        const schema: RequestSchema = {
            querystring: {
                type: 'object',
                required: [],
                properties: {
                    from: { 
                        type: 'string', 
                    },
                    to: { 
                        type: 'string', 
                    },
                    limit: {
                        type: 'number',
                    },
                    type: { 
                        type: 'string', 
                        enum: CHART_TYPES,
                    },
                },
            }
        };

        return {
            name: 'GetAdHocChartForPeriod',
            method: 'GET',
            path: '/api/v1/charts/ad-hoc',
            schema,
            handler: this.handler,
            authenticated: true,
        };
    }

}