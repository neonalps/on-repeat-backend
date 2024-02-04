import { requireNonNull } from "@src/util/common";
import { RequestSchema, RouteDefinition, RouteProvider } from "@src/router/types";
import { PlayedTrackApiDto } from "@src/models/api/played-track";
import { UpdatePlayedTrackByIdRequestDto } from "@src/models/api/update-played-track-by-id-request";
import { UpdatePlayedTrackByIdHandler } from "./handler";

export class UpdatePlayedTrackByIdRouteProvider implements RouteProvider<UpdatePlayedTrackByIdRequestDto, PlayedTrackApiDto> {

    private readonly handler: UpdatePlayedTrackByIdHandler;

    constructor(handler: UpdatePlayedTrackByIdHandler) {
        this.handler = requireNonNull(handler);
    }

    provide(): RouteDefinition<UpdatePlayedTrackByIdRequestDto, PlayedTrackApiDto> {
        const schema: RequestSchema = {
            params: {
                type: 'object',
                required: ['playedTrackId'],
                properties: {
                    playedTrackId: { type: 'string' },
                },
            }
        };

        return {
            name: 'UpdatePlayedTrackById',
            method: 'POST',
            path: '/api/v1/played-tracks/:playedTrackId',
            schema,
            handler: this.handler,
            authenticated: true,
            response: {
                statusCode: 200,
            }
        };
    }

}