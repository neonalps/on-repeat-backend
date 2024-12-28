import { AuthenticationContext, RouteHandler } from "@src/router/types";
import { requireNonNull } from "@src/util/common";
import { AccountDao } from "@src/models/classes/dao/account";
import { ApiHelper } from "@src/api/helper";
import { ProfileInfoApiDto } from "@src/models/api/profile-info";
import { PlayedTrackService } from "@src/modules/played-tracks/service";
import { GetAllAccountJobsPaginatedHandler } from "@src/api/v1/account-job/get-all-paginated/handler";
import { GetAllAccountTokensHandler } from "@src/api/v1/account-token/get-all/handler";

export class GetProfileInfoHandler implements RouteHandler<void, ProfileInfoApiDto> {

    private readonly getAllAccountJobsPaginatedHandler: GetAllAccountJobsPaginatedHandler;
    private readonly getAllAccountTokensPaginatedHandler: GetAllAccountTokensHandler;
    private readonly apiHelper: ApiHelper;
    private readonly playedTrackService: PlayedTrackService;
    
    constructor(
        getAllAccountJobsPaginatedHandler: GetAllAccountJobsPaginatedHandler,
        getAllAccountTokensPaginatedHandler: GetAllAccountTokensHandler,
        apiHelper: ApiHelper, 
        playedTrackService: PlayedTrackService
    ) {
        this.getAllAccountJobsPaginatedHandler = requireNonNull(getAllAccountJobsPaginatedHandler);
        this.getAllAccountTokensPaginatedHandler = requireNonNull(getAllAccountTokensPaginatedHandler);
        this.apiHelper = requireNonNull(apiHelper);
        this.playedTrackService = requireNonNull(playedTrackService);
    }
    
    public async handle(context: AuthenticationContext, _: void): Promise<ProfileInfoApiDto> {
        const accountId = (context.account as AccountDao).id;

        const [accountJobs, accountPlayedInfo, accountTokens] = await Promise.all([
            this.getAllAccountJobsPaginatedHandler.handle(context, {}),
            this.playedTrackService.getPlayedInfoForAccount(accountId),
            this.getAllAccountTokensPaginatedHandler.handle(context),
        ]);

        return {
            accountJobs,
            playedInfo: this.apiHelper.convertPlayedInfo(accountPlayedInfo),
            accountTokens,
        };
    }

}