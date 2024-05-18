import { PaginatedResponseDto } from "@src/models/api/paginated-response";
import { RequestSchema, RouteDefinition, RouteProvider } from "@src/router/types";
import { requireNonNull } from "@src/util/common";
import { GeneratedChartApiDto } from "@src/models/api/generated-chart";
import { GetGeneratedChartsHandler } from "@src/api/v1/chart/get-all-generated/handler";

export class GetGeneratedChartsRouteProvider implements RouteProvider<void, PaginatedResponseDto<GeneratedChartApiDto>> {

    private readonly handler: GetGeneratedChartsHandler;
    
    constructor(handler: GetGeneratedChartsHandler) {
        this.handler = requireNonNull(handler);
    }

    provide(): RouteDefinition<void, PaginatedResponseDto<GeneratedChartApiDto>> {
        const schema: RequestSchema = {};

        return {
            name: 'GetAccountCharts',
            method: 'GET',
            path: '/api/v1/charts/generated',
            schema,
            handler: this.handler,
            authenticated: true,
        };
    }

}