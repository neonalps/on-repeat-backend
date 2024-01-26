import { AuthenticationError } from "@src/api/error/authentication-error";
import { PlayedTrackService } from "@src/modules/played-tracks/service";
import { requireNonNull } from "@src/util/common";

export class AuthHelper {

    private static readonly ERROR_ILLEGAL_ACCESS = "You are not authorized to access this entity";

    private readonly playedTrackService: PlayedTrackService;

    constructor(playedTrackService: PlayedTrackService) {
        this.playedTrackService = requireNonNull(playedTrackService);
    }

    public async validatePlayedTrackBelongsToAccount(accountId: number, playedTrackId: number): Promise<void> {
        const playedTrackInAccount = await this.playedTrackService.getByAccountIdAndPlayedTrackId(accountId, playedTrackId);
        if (playedTrackInAccount === null) {
            throw new AuthenticationError(AuthHelper.ERROR_ILLEGAL_ACCESS);
        }
    }

}