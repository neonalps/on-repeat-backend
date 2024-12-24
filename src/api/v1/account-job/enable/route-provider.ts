import { RequestSchema, RouteDefinition, RouteProvider } from "@src/router/types";
import { EnableAccountJobHandler } from "@src/api/v1/account-job/enable/handler";
import { requireNonNull } from "@src/util/common";
import { AccountJobApiDto } from "@src/models/api/account-job";
import { EnableAccountJobRequestDto } from "@src/models/api/enable-account-job-request";

export class EnableAccountJobRouteProvider implements RouteProvider<EnableAccountJobRequestDto, AccountJobApiDto> {
    
    private readonly handler: EnableAccountJobHandler;

    constructor(handler: EnableAccountJobHandler) {
        this.handler = requireNonNull(handler);
    }

    provide(): RouteDefinition<EnableAccountJobRequestDto, AccountJobApiDto> {
        const schema: RequestSchema = {
            params: {
                type: 'object',
                required: ["accountJobId"],
                properties: {
                    accountJobId: { type: 'number' },
                },
            },
        };

        return {
            name: 'EnableAccountJob',
            method: 'POST',
            path: '/api/v1/account-jobs/:accountJobId/enable',
            schema, 
            handler: this.handler,
            authenticated: true,
            response: {
                statusCode: 200,
            },
        };
    }

}