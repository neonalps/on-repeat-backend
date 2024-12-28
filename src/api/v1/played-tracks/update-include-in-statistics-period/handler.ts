import { ApiHelper } from "@src/api/helper";
import { PlayedTrackApiDto } from "@src/models/api/played-track";
import { UpdateIncludeInStatisticsForPeriodRequestDto } from "@src/models/api/update-include-in-statistics-for-period-request";
import { AccountDao } from "@src/models/classes/dao/account";
import { PlayedTrackService } from "@src/modules/played-tracks/service";
import { AuthenticationContext, RouteHandler } from "@src/router/types";
import { requireNonNull } from "@src/util/common";

export class UpdateIncludeInStatisticsForPeriodHandler implements RouteHandler<UpdateIncludeInStatisticsForPeriodRequestDto, PlayedTrackApiDto[]> {

    private readonly apiHelper: ApiHelper;
    private readonly playedTrackService: PlayedTrackService;

    constructor(apiHelper: ApiHelper, playedTrackService: PlayedTrackService) {
        this.apiHelper = requireNonNull(apiHelper);
        this.playedTrackService = requireNonNull(playedTrackService);
    }

    public async handle(context: AuthenticationContext, dto: UpdateIncludeInStatisticsForPeriodRequestDto): Promise<PlayedTrackApiDto[]> {
        const accountId = (context.account as AccountDao).id;

        const trackIdsInPeriod = await this.playedTrackService.updateIncludeInStatisticsForPeriod(accountId, dto.from, dto.to, dto.includeInStatistics);
        const playedTrackDetails = await this.playedTrackService.getMultiplePlayedTrackDetailsById(trackIdsInPeriod);
        
        return playedTrackDetails.map(item => this.apiHelper.convertPlayedTrackApiDto(item));
    }
    
}