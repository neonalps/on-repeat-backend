import { requireNonNull } from "@src/util/common";
import { RequestSchema, RouteDefinition, RouteProvider } from "@src/router/types";
import { ProfileInfoApiDto } from "@src/models/api/profile-info";
import { GetProfileInfoHandler } from "@src/api/v1/account/get-profile-info/handler";

export class GetProfileInfoRouteProvider implements RouteProvider<void, ProfileInfoApiDto> {

    private readonly handler: GetProfileInfoHandler;

    constructor(handler: GetProfileInfoHandler) {
        this.handler = requireNonNull(handler);
    }

    provide(): RouteDefinition<void, ProfileInfoApiDto> {
        const schema: RequestSchema = {};

        return {
            name: 'GetProfileInfo',
            method: 'GET',
            path: '/api/v1/accounts/profile-info',
            schema,
            handler: this.handler,
            authenticated: true,
        };
    }

}