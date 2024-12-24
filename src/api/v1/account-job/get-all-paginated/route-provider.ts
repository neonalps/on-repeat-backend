import { GetAccountJobsPaginatedRequestDto } from "@src/models/api/get-account-jobs-paginated-request";
import { PaginatedResponseDto } from "@src/models/api/paginated-response";
import { RequestSchema, RouteDefinition, RouteProvider } from "@src/router/types";
import { GetAllAccountJobsPaginatedHandler } from "./handler";
import { requireNonNull } from "@src/util/common";
import { PAGINATED_REQUEST_QUERYSTRING_SCHEMA_PROPERTIES } from "@src/modules/pagination/constants";
import { AccountJobApiDto } from "@src/models/api/account-job";

export class GetAllAccountJobsPaginatedRouteProvider implements RouteProvider<GetAccountJobsPaginatedRequestDto, PaginatedResponseDto<AccountJobApiDto>> {
    
    private readonly handler: GetAllAccountJobsPaginatedHandler;

    constructor(handler: GetAllAccountJobsPaginatedHandler) {
        this.handler = requireNonNull(handler);
    }

    provide(): RouteDefinition<GetAccountJobsPaginatedRequestDto, PaginatedResponseDto<AccountJobApiDto>> {
        const schema: RequestSchema = {
            querystring: {
                type: 'object',
                required: [],
                properties: {
                    ...PAGINATED_REQUEST_QUERYSTRING_SCHEMA_PROPERTIES,
                },
            },
        };

        return {
            name: 'GetAllAccountJobsPaginated',
            method: 'GET',
            path: '/api/v1/account-jobs',
            schema, 
            handler: this.handler,
            authenticated: true,
        };
    }

}