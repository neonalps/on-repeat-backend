import { AuthenticationContext, RouteHandler } from "@src/router/types";
import { AccountTokenService } from "@src/modules/account-token/service";
import { removeNull, requireNonNull } from "@src/util/common";
import { AccountDao } from "@src/models/classes/dao/account";
import { PaginatedResponseDto } from "@src/models/api/paginated-response";
import { AccountTokenApiDto } from "@src/models/api/account-token";
import { ApiHelper } from "@src/api/helper";

export class GetAllAccountTokensHandler implements RouteHandler<void, PaginatedResponseDto<AccountTokenApiDto>> {

    private readonly accountTokenService: AccountTokenService;
    private readonly apiHelper: ApiHelper;
    
    constructor(accountTokenService: AccountTokenService, apiHelper: ApiHelper) {
        this.accountTokenService = requireNonNull(accountTokenService);
        this.apiHelper = requireNonNull(apiHelper);
    }
    
    public async handle(context: AuthenticationContext, _: void): Promise<PaginatedResponseDto<AccountTokenApiDto>> {
        const accountId = (context.account as AccountDao).id;

        const accountTokenDaos = await this.accountTokenService.getAllByAccountId(accountId);

        const items = accountTokenDaos.map(item => this.apiHelper.convertAccountTokenApiDto(item)).filter(removeNull) as AccountTokenApiDto[];

        return {
            items,
        }
    }

}