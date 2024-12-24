import { ApiHelper } from "@src/api/helper";
import { Dependencies } from "@src/di/dependencies";
import dependencyManager from "@src/di/manager";
import { PaginationService } from "@src/modules/pagination/service";
import { RouteProvider } from "@src/router/types";
import { GetAllAccountJobsPaginatedHandler } from "@src/api/v1/account-job/get-all-paginated/handler";
import { AccountJobService } from "@src/modules/account-jobs/service";
import { GetAllAccountJobsPaginatedRouteProvider } from "@src/api/v1/account-job/get-all-paginated/route-provider";
import { DisableAccountJobHandler } from "@src/api/v1/account-job/disable/handler";
import { JobHelper } from "@src/modules/job/helper";
import { EnableAccountJobHandler } from "@src/api/v1/account-job/enable/handler";
import { DisableAccountJobRouteProvider } from "@src/api/v1/account-job/disable/route-provider";
import { EnableAccountJobRouteProvider } from "@src/api/v1/account-job/enable/route-provider";

export function getAccountJobRouteProviders(): RouteProvider<any, any>[] {
    const accountJobService = dependencyManager.get<AccountJobService>(Dependencies.AccountJobService);
    const apiHelper = dependencyManager.get<ApiHelper>(Dependencies.ApiHelper);
    const jobHelper = dependencyManager.get<JobHelper>(Dependencies.JobHelper);
    const paginationService = dependencyManager.get<PaginationService>(Dependencies.PaginationService);

    const disableAccountJobHandler = new DisableAccountJobHandler(accountJobService, apiHelper, jobHelper);
    const enableAccountJobHandler = new EnableAccountJobHandler(accountJobService, apiHelper, jobHelper);
    const getAllAccountJobsPaginatedHandler = new GetAllAccountJobsPaginatedHandler(accountJobService, apiHelper, jobHelper, paginationService);

    return [
        new DisableAccountJobRouteProvider(disableAccountJobHandler),
        new EnableAccountJobRouteProvider(enableAccountJobHandler),
        new GetAllAccountJobsPaginatedRouteProvider(getAllAccountJobsPaginatedHandler),
    ];
}