import { RequestSchema, RouteDefinition, RouteProvider } from "@src/router/types";
import { requireNonNull } from "@src/util/common";
import { GetAccountChartDetailsRequestDto } from "@src/models/api/get-account-chart-details-request";
import { AccountChartDetailsApiDto } from "@src/models/api/account-chart-details";
import { GetAccountChartDetailsHandler } from "@src/api/v1/chart/get-by-id/handler";

export class GetAccountChartDetailsRouteProvider implements RouteProvider<GetAccountChartDetailsRequestDto, AccountChartDetailsApiDto<unknown>> {

    private readonly handler: GetAccountChartDetailsHandler;
    
    constructor(handler: GetAccountChartDetailsHandler) {
        this.handler = requireNonNull(handler);
    }

    provide(): RouteDefinition<GetAccountChartDetailsRequestDto, AccountChartDetailsApiDto<unknown>> {
        const schema: RequestSchema = {
            params: {
                type: 'object',
                required: ['chartId'],
                properties: {
                    chartId: { type: 'string' },
                },
            }
        };

        return {
            name: 'GetAccountChartDetails',
            method: 'GET',
            path: '/api/v1/charts/:chartId',
            schema,
            handler: this.handler,
            authenticated: true,
        };
    }

}