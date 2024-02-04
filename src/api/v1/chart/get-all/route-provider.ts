import { AccountChartApiDto } from "@src/models/api/account-chart";
import { GetAccountChartsRequestDto } from "@src/models/api/get-account-charts-request";
import { PaginatedResponseDto } from "@src/models/api/paginated-response";
import { RequestSchema, RouteDefinition, RouteProvider } from "@src/router/types";
import { requireNonNull } from "@src/util/common";
import { GetAccountChartsHandler } from "@src/api/v1/chart/get-all/handler";

export class GetAccountChartsRouteProvider implements RouteProvider<GetAccountChartsRequestDto, PaginatedResponseDto<AccountChartApiDto>> {

    private readonly handler: GetAccountChartsHandler;
    
    constructor(handler: GetAccountChartsHandler) {
        this.handler = requireNonNull(handler);
    }

    provide(): RouteDefinition<GetAccountChartsRequestDto, PaginatedResponseDto<AccountChartApiDto>> {
        const schema: RequestSchema = {};

        return {
            name: 'GetAccountCharts',
            method: 'GET',
            path: '/api/v1/charts',
            schema,
            handler: this.handler,
            authenticated: true,
        };
    }

}