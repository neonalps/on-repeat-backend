import { requireNonNull } from "@src/util/common";
import { RequestSchema, RouteDefinition, RouteProvider } from "@src/router/types";
import { PlayedTrackApiDto } from "@src/models/api/played-track";
import { UpdateIncludeInStatisticsForPeriodHandler } from "@src/api/v1/played-tracks/update-include-in-statistics-period/handler";
import { UpdateIncludeInStatisticsForPeriodRequestDto } from "@src/models/api/update-include-in-statistics-for-period-request";

export class UpdateIncludeInStatisticsForPeriodRouteProvider implements RouteProvider<UpdateIncludeInStatisticsForPeriodRequestDto, PlayedTrackApiDto[]> {

    private readonly handler: UpdateIncludeInStatisticsForPeriodHandler;

    constructor(handler: UpdateIncludeInStatisticsForPeriodHandler) {
        this.handler = requireNonNull(handler);
    }

    provide(): RouteDefinition<UpdateIncludeInStatisticsForPeriodRequestDto, PlayedTrackApiDto[]> {
        const schema: RequestSchema = {
            body: {
                type: 'object',
                required: ['from', 'to', 'includeInStatistics'],
                properties: {
                    from: { type: 'string' },
                    to: { type: 'string' },
                    includeInStatistics: { type: 'boolean' },
                },
            }
        };

        return {
            name: 'UpdateIncludeInStatisticsForPeriod',
            method: 'POST',
            path: '/api/v1/played-tracks/update-include-in-statistics',
            schema,
            handler: this.handler,
            authenticated: true,
            response: {
                statusCode: 200,
            }
        };
    }

}