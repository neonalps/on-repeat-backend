import { ApiHelper } from "@src/api/helper";
import { PlayedTrackApiDto } from "@src/models/api/played-track";
import { UpdatePlayedTrackByIdRequestDto } from "@src/models/api/update-played-track-by-id-request";
import { AccountDao } from "@src/models/classes/dao/account";
import { PlayedTrackService } from "@src/modules/played-tracks/service";
import { AuthenticationContext, RouteHandler } from "@src/router/types";
import { requireNonNull } from "@src/util/common";

export class UpdatePlayedTrackByIdHandler implements RouteHandler<UpdatePlayedTrackByIdRequestDto, PlayedTrackApiDto> {

    private readonly apiHelper: ApiHelper;
    private readonly playedTrackService: PlayedTrackService;

    constructor(apiHelper: ApiHelper, playedTrackService: PlayedTrackService) {
        this.apiHelper = requireNonNull(apiHelper);
        this.playedTrackService = requireNonNull(playedTrackService);
    }

    public async handle(context: AuthenticationContext, dto: UpdatePlayedTrackByIdRequestDto): Promise<PlayedTrackApiDto> {
        const accountId = (context.account as AccountDao).id;
        const playedTrackId = dto.playedTrackId;

        // TODO validate that played track belongs to account
        
        const updatedPlayedTrack = await this.playedTrackService.updateById(playedTrackId, dto.includeInStatistics);
        return this.apiHelper.convertPlayedTrackApiDto(updatedPlayedTrack);
    }
    
}