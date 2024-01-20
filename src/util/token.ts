import { Base64Utils } from "@src/util/base64";

export function parseJwt(token: string): Record<string, unknown> {
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) {
        throw new Error(`Invalid token passed`);
    }

    return JSON.parse(Base64Utils.decode(tokenParts[1]));
}