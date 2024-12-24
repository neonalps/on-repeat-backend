import { RequestSchema, RouteDefinition, RouteProvider } from "@src/router/types";
import { requireNonNull } from "@src/util/common";
import { AccountJobApiDto } from "@src/models/api/account-job";
import { DisableAccountJobRequestDto } from "@src/models/api/disable-account-job-request";
import { DisableAccountJobHandler } from "@src/api/v1/account-job/disable/handler";

export class DisableAccountJobRouteProvider implements RouteProvider<DisableAccountJobRequestDto, AccountJobApiDto> {
    
    private readonly handler: DisableAccountJobHandler;

    constructor(handler: DisableAccountJobHandler) {
        this.handler = requireNonNull(handler);
    }

    provide(): RouteDefinition<DisableAccountJobRequestDto, AccountJobApiDto> {
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
            name: 'DisableAccountJob',
            method: 'POST',
            path: '/api/v1/account-jobs/:accountJobId/disable',
            schema, 
            handler: this.handler,
            authenticated: true,
            response: {
                statusCode: 200,
            },
        };
    }

}