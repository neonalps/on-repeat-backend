import jwt from "jsonwebtoken";
import { TimeSource } from "@src/util/time";
import { requireNonNull } from "@src/util/common";
import { validateNotBlank, validateNotNull } from "@src/util/validation";
import { AuthToken } from "@src/models/classes/auth-token";
import { Jwt } from "@src/models/interface/jwt";

export interface TokenConfig {
    accessTokenValiditySeconds: number;
    refreshTokenValiditySeconds: number;
    audience: string;
    issuer: string;
    signingKey: string;
}

export class AuthService {

    private readonly tokenConfig: TokenConfig;
    private readonly timeSource: TimeSource;

    private static readonly TOKEN_TYPE_ACCESS = "ACCESS";
    private static readonly TOKEN_TYPE_REFRESH = "REFRESH";

    constructor(tokenConfig: TokenConfig, timeSource: TimeSource) {
        this.tokenConfig = requireNonNull(tokenConfig);
        this.timeSource = requireNonNull(timeSource);

        this.validateConfig();
    }

    public createSignedAccessToken(subject: string, scopes: Set<string>): string {
        const accessToken = this.issueAccessToken(subject, scopes);
        return this.signToken(accessToken.convertToJwt());
    }

    public createSignedRefreshToken(subject: string, scopes: Set<string>): string {
        const refreshToken = this.issueRefreshToken(subject, scopes);
        return this.signToken(refreshToken.convertToJwt());
    }
    
    private issueAccessToken(subject: string, scopes: Set<string>): AuthToken {
        const now = this.timeSource.getCurrentUnixTimestamp();
        const expiresAt = now + this.tokenConfig.accessTokenValiditySeconds;

        return AuthToken.Builder
            .withTokenType(AuthService.TOKEN_TYPE_ACCESS)
            .withIssuer(this.tokenConfig.issuer)
            .withAudience(this.tokenConfig.audience)
            .withSubject(subject)
            .withScopes(scopes)
            .withIssuedAt(now)
            .withNotBefore(now)
            .withExpiresAt(expiresAt)
            .build();
    }

    private issueRefreshToken(subject: string, scopes: Set<string>): AuthToken {
        const now = this.timeSource.getCurrentUnixTimestamp();
        const expiresAt = now + this.tokenConfig.refreshTokenValiditySeconds;

        return AuthToken.Builder
            .withTokenType(AuthService.TOKEN_TYPE_REFRESH)
            .withIssuer(this.tokenConfig.issuer)
            .withAudience(this.tokenConfig.audience)
            .withSubject(subject)
            .withScopes(scopes)
            .withIssuedAt(now)
            .withNotBefore(now)
            .withExpiresAt(expiresAt)
            .build();
    }
    
    private signToken(token: Jwt): string {
        return jwt.sign(token, this.tokenConfig.signingKey);
    }

    private validateConfig(): void {
        validateNotNull(this.tokenConfig.accessTokenValiditySeconds, "tokenConfig.accessTokenValiditySeconds");
        validateNotNull(this.tokenConfig.refreshTokenValiditySeconds, "tokenConfig.refreshTokenValiditySeconds");
        validateNotBlank(this.tokenConfig.issuer, "tokenConfig.issuer");
        validateNotBlank(this.tokenConfig.audience, "tokenConfig.audience");
        validateNotBlank(this.tokenConfig.signingKey, "tokenConfig.signingKey");
    }

}