import { RefreshTokenRequestDto } from "@src/models/api/refresh-token-request";
import { TokenResponseDto } from "@src/models/api/token-response";
import { RequestSchema, RouteDefinition, RouteProvider } from "@src/router/types";
import { RefreshTokenHandler } from "@src/api/v1/login/refresh-token/handler";
import { requireNonNull } from "@src/util/common";

export class RefreshTokenRouteProvider implements RouteProvider<RefreshTokenRequestDto, TokenResponseDto> {

    private readonly handler: RefreshTokenHandler;

    constructor(handler: RefreshTokenHandler) {
        this.handler = requireNonNull(handler);
    }

    provide(): RouteDefinition<RefreshTokenRequestDto, TokenResponseDto> {
        const schema: RequestSchema = {
            body: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                    refreshToken: { type: 'string' },
                },
            }
        };

        return {
            name: 'RefreshAccessToken',
            method: 'POST',
            path: '/api/v1/oauth/refresh-token',
            schema, 
            handler: this.handler,
            authenticated: false,
        };
    }

}