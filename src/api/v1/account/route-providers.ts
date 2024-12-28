import { Dependencies } from "@src/di/dependencies";
import dependencyManager from "@src/di/manager";
import { AccountService } from "@src/modules/account/service";
import { UpdateAccountDisplayNameHandler } from "./update-display-name/handler";
import { RouteProvider } from "@src/router/types";
import { UpdateAccountDisplayNameRouteProvider } from "./update-display-name/route-provider";
import { GetProfileInfoHandler } from "./get-profile-info/handler";
import { PlayedTrackService } from "@src/modules/played-tracks/service";
import { GetAllAccountTokensHandler } from "../account-token/get-all/handler";
import { AccountTokenService } from "@src/modules/account-token/service";
import { ApiHelper } from "@src/api/helper";
import { GetAllAccountJobsPaginatedHandler } from "../account-job/get-all-paginated/handler";
import { AccountJobService } from "@src/modules/account-jobs/service";
import { JobHelper } from "@src/modules/job/helper";
import { PaginationService } from "@src/modules/pagination/service";
import { GetProfileInfoRouteProvider } from "./get-profile-info/route-provider";

export function getAccountRouteProviders(): RouteProvider<any, any>[] {
    const accountService = dependencyManager.get<AccountService>(Dependencies.AccountService);
    const accountJobService = dependencyManager.get<AccountJobService>(Dependencies.AccountJobService);
    const accountTokenService = dependencyManager.get<AccountTokenService>(Dependencies.AccountTokenService);
    const apiHelper = dependencyManager.get<ApiHelper>(Dependencies.ApiHelper);
    const jobHelper = dependencyManager.get<JobHelper>(Dependencies.JobHelper);
    const paginationService = dependencyManager.get<PaginationService>(Dependencies.PaginationService);
    const playedTrackService = dependencyManager.get<PlayedTrackService>(Dependencies.PlayedTrackService);

    const getAllAccountTokensHandler = new GetAllAccountTokensHandler(accountTokenService, apiHelper);
    const getAllAccountJobsPaginatedHandler = new GetAllAccountJobsPaginatedHandler(accountJobService, apiHelper, jobHelper, paginationService);

    const getProfileInfoHandler = new GetProfileInfoHandler(getAllAccountJobsPaginatedHandler, getAllAccountTokensHandler, apiHelper, playedTrackService);
    const updateDisplayNameHandler = new UpdateAccountDisplayNameHandler(accountService);

    return [
        new GetProfileInfoRouteProvider(getProfileInfoHandler),
        new UpdateAccountDisplayNameRouteProvider(updateDisplayNameHandler),
    ];
}