import { IllegalStateError } from "@src/api/error/illegal-state-error";
import { ApiHelper } from "@src/api/helper";
import { AccountJobApiDto } from "@src/models/api/account-job";
import { DisableAccountJobRequestDto } from "@src/models/api/disable-account-job-request";
import { AccountDao } from "@src/models/classes/dao/account";
import { AccountJobService } from "@src/modules/account-jobs/service";
import { JobHelper } from "@src/modules/job/helper";
import { AuthenticationContext, RouteHandler } from "@src/router/types";
import { requireNonNull } from "@src/util/common";

export class DisableAccountJobHandler implements RouteHandler<DisableAccountJobRequestDto, AccountJobApiDto> {

    private readonly accountJobService: AccountJobService;
    private readonly apiHelper: ApiHelper;
    private readonly jobHelper: JobHelper;

    constructor(
        accountJobService: AccountJobService,
        apiHelper: ApiHelper,
        jobHelper: JobHelper,
    ) {
        this.accountJobService = requireNonNull(accountJobService);
        this.apiHelper = requireNonNull(apiHelper);
        this.jobHelper = requireNonNull(jobHelper);
    }

    public async handle(context: AuthenticationContext, dto: DisableAccountJobRequestDto): Promise<AccountJobApiDto> {
        const accountId = (context.account as AccountDao).id;

        const accountJobId = dto.accountJobId;
        if (!(await this.accountJobService.checkAccountJobExists(accountId, accountJobId))) {
            throw new Error(`No account job with this ID exists for this account`);
        }

        await this.accountJobService.disableAccountJob(accountJobId);

        const accountJobDetails = await this.jobHelper.getAccountJobDetails(accountJobId);
        if (accountJobDetails === null) {
            throw new IllegalStateError("Account job does no longer exist");
        }

        return this.apiHelper.convertAccountJobApiDto(accountJobDetails) as AccountJobApiDto;
    }

}