import { RefreshTokenRequestDto } from "@src/models/api/refresh-token-request";
import { TokenResponseDto } from "@src/models/api/token-response";
import { AuthService, TokenConfig } from "@src/modules/auth/service";
import { AuthenticationContext, RouteHandler } from "@src/router/types";
import { requireNonNull } from "@src/util/common";
import { DateUtils } from "@src/util/date";
import { TimeSource } from "@src/util/time";
import { parseJwt } from "@src/util/token";
import { validateNotBlank, validateNotEmpty, validateNotNull } from "@src/util/validation";

export class RefreshTokenHandler implements RouteHandler<RefreshTokenRequestDto, TokenResponseDto> {

    private readonly authService: AuthService;
    private readonly timeSource: TimeSource;
    private readonly tokenConfig: TokenConfig;

    constructor(authService: AuthService, timeSource: TimeSource, tokenConfig: TokenConfig) {
        this.authService = requireNonNull(authService);
        this.timeSource = requireNonNull(timeSource);
        this.tokenConfig = requireNonNull(tokenConfig);
    }

    public async handle(_: AuthenticationContext, dto: RefreshTokenRequestDto): Promise<TokenResponseDto> {
        const oldRefreshToken = dto.refreshToken;

        const parsedToken = parseJwt(oldRefreshToken);

        const issuer = parsedToken["iss"] as string;
        validateNotBlank(issuer, "issuer");
        if (issuer !== this.tokenConfig.issuer) {
            throw new Error("Invalid token issuer");
        }

        const audience = parsedToken["aud"] as string;
        validateNotBlank(audience, "audience");
        if (audience !== this.tokenConfig.audience) {
            throw new Error("Invalid token audience");
        }

        const expiresAt = parsedToken["exp"] as number;
        validateNotNull(expiresAt, "expiresAt");
        if (DateUtils.getDateFromUnixTimestamp(expiresAt) < this.timeSource.getNow()) {
            throw new Error(`Refresh token has already expired`);
        }

        const userId = parsedToken["sub"] as string;
        validateNotBlank(userId, "userId");

        const scopes = parsedToken["scp"] as Set<string>;
        validateNotEmpty(scopes, "scopes");

        const newAccessToken = this.authService.createSignedAccessToken(userId, scopes);
        const newRefreshToken = this.authService.createSignedRefreshToken(userId, scopes);

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }

}