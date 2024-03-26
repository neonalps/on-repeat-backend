import { RequestSchema, RouteDefinition, RouteProvider } from "@src/router/types";
import { requireNonNull } from "@src/util/common";
import { CreateAccountChartRequestDto } from "@src/models/api/create-account-chart-request";
import { CreateAccountChartHandler } from "@src/api/v1/chart/create/handler";
import { CHART_TYPES } from "@src/modules/chart/constants";
import { AccountChartDetailsApiDto } from "@src/models/api/account-chart-details";

export class CreateAccountChartRouteProvider implements RouteProvider<CreateAccountChartRequestDto, AccountChartDetailsApiDto<unknown>> {

    private readonly handler: CreateAccountChartHandler;
    
    constructor(handler: CreateAccountChartHandler) {
        this.handler = requireNonNull(handler);
    }

    provide(): RouteDefinition<CreateAccountChartRequestDto, AccountChartDetailsApiDto<unknown>> {
        const schema: RequestSchema = {
            body: {
                type: 'object',
                required: ['name', 'type', 'from', 'to'],
                properties: {
                    name: { type: 'string' },
                    type: { type: 'string', enum: CHART_TYPES },
                    from: { type: 'string', format: 'date' },
                    to: { type: 'string', format: 'date' },
                },
                additionalProperties: false,
            }
        };

        return {
            name: 'CreateAccountChart',
            method: 'POST',
            path: '/api/v1/charts',
            schema,
            handler: this.handler,
            authenticated: true,
        };
    }

}