import { RequestSchema, RouteDefinition, RouteProvider } from "@src/router/types";
import { requireNonNull } from "@src/util/common";
import { CHART_TYPES } from "@src/modules/chart/constants";
import { AccountChartDetailsApiDto } from "@src/models/api/account-chart-details";
import { PutAccountChartRequestDto } from "@src/models/api/put-account-chart-request";
import { PutAccountChartHandler } from "@src/api/v1/chart/put-by-id/handler";

export class PutAccountChartRouteProvider implements RouteProvider<PutAccountChartRequestDto, AccountChartDetailsApiDto<unknown>> {

    private readonly handler: PutAccountChartHandler;
    
    constructor(handler: PutAccountChartHandler) {
        this.handler = requireNonNull(handler);
    }

    provide(): RouteDefinition<PutAccountChartRequestDto, AccountChartDetailsApiDto<unknown>> {
        const schema: RequestSchema = {
            params: {
                type: 'object',
                required: ['accountChartId'],
                properties: {
                    accountChartId: { type: 'string' },
                },
            },
            body: {
                type: 'object',
                required: ['name', 'type', 'from', 'to'],
                properties: {
                    name: { type: 'string' },
                    type: { type: 'string', enum: CHART_TYPES },
                    from: { type: 'string' },
                    to: { type: 'string' },
                    items: { 
                        type: 'array',
                        items: { 
                            type: 'object', 
                            required: ['itemId', 'place'], 
                            properties: { 
                                itemId: { type: 'number' }, 
                                place: { type: 'number' } 
                            },
                        },
                    },
                },
                additionalProperties: false,
            },
        };

        return {
            name: 'PutAccountChart',
            method: 'PUT',
            path: '/api/v1/charts/:accountChartId',
            schema,
            handler: this.handler,
            authenticated: true,
        };
    }

}