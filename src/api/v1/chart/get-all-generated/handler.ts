import { GeneratedChartApiDto } from "@src/models/api/generated-chart";
import { PaginatedResponseDto } from "@src/models/api/paginated-response";
import { AccountDao } from "@src/models/classes/dao/account";
import { PlayedTrackService } from "@src/modules/played-tracks/service";
import { AuthenticationContext, RouteHandler } from "@src/router/types";
import { requireNonNull } from "@src/util/common";

export class GetGeneratedChartsHandler implements RouteHandler<void, PaginatedResponseDto<GeneratedChartApiDto>> {

    private readonly playedTrackService: PlayedTrackService;
    
    constructor(playedTrackService: PlayedTrackService) {
        this.playedTrackService = requireNonNull(playedTrackService);
    }

    public async handle(context: AuthenticationContext, _: void): Promise<PaginatedResponseDto<GeneratedChartApiDto>> {
        const accountId = (context.account as AccountDao).id;

        const accountPlayedInfo = await this.playedTrackService.getPlayedInfoForAccount(accountId);
        if (accountPlayedInfo === PlayedTrackService.EMPTY_PLAYED_INFO) {
            return {
                items: [],
            };
        }

        const items: GeneratedChartApiDto[] = [
            { name: "All-time favourite tracks", year: null, month: null, day: null, type: "track", },
            { name: "All-time favourite artists", year: null, month: null, day: null, type: "artist", },
        ];

        const startYear = (accountPlayedInfo.firstPlayedAt as Date).getFullYear();
        const endYear = (accountPlayedInfo.lastPlayedAt as Date).getFullYear();

        for (let year = endYear; year >= startYear; year--) {
            items.push(
                { name: `${year} Tracks`, year, month: null, day: null, type: "track", },
                { name: `${year} Artists`, year, month: null, day: null, type: "artist", },
            );
        }

        return {
            items,
        }        
    }

}