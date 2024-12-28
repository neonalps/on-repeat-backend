import { Dependencies } from "@src/di/dependencies";
import dependencyManager from "@src/di/manager";
import { ChartService } from "@src/modules/chart/service";
import { GetChartForPeriodRouteProvider } from "@src/api/v1/chart/get-ad-hoc-for-period/route-provider";
import { GetChartForPeriodHandler } from "@src/api/v1/chart/get-ad-hoc-for-period/handler";
import { GetAccountChartsHandler } from "@src/api/v1/chart/get-all/handler";
import { GetAccountChartsRouteProvider } from "@src/api/v1/chart/get-all/route-provider";
import { ApiHelper } from "@src/api/helper";
import { PaginationService } from "@src/modules/pagination/service";
import { GetAccountChartDetailsHandler } from "@src/api/v1/chart/get-by-id/handler";
import { GetAccountChartDetailsRouteProvider } from "@src/api/v1/chart/get-by-id/route-provider";
import { CreateAccountChartHandler } from "@src/api/v1/chart/create/handler";
import { CreateAccountChartRouteProvider } from "@src/api/v1/chart/create/route-provider";
import { PutAccountChartHandler } from "@src/api/v1/chart/put-by-id/handler";
import { PutAccountChartRouteProvider } from "@src/api/v1/chart/put-by-id/route-provider";
import { GetGeneratedChartsHandler } from "@src/api/v1/chart/get-all-generated/handler";
import { GetGeneratedChartsRouteProvider } from "@src/api/v1/chart/get-all-generated/route-provider";
import { PlayedTrackService } from "@src/modules/played-tracks/service";

export const getChartApiRouteProviders = () => {
    const apiHelper = dependencyManager.get<ApiHelper>(Dependencies.ApiHelper);
    const chartService = dependencyManager.get<ChartService>(Dependencies.ChartService);
    const paginationService = dependencyManager.get<PaginationService>(Dependencies.PaginationService);
    const playedTrackService = dependencyManager.get<PlayedTrackService>(Dependencies.PlayedTrackService);

    const createAccountChartHandler = new CreateAccountChartHandler(chartService);
    const getAccountChartsHandler = new GetAccountChartsHandler(apiHelper, chartService, paginationService);
    const getAccountChartDetailsHandler = new GetAccountChartDetailsHandler(chartService);
    const getChartForPeriodHandler = new GetChartForPeriodHandler(chartService, playedTrackService);
    const getGeneratedChartsHandler = new GetGeneratedChartsHandler(playedTrackService);
    const putAccountChartsHandler = new PutAccountChartHandler(chartService);

    return [
        new CreateAccountChartRouteProvider(createAccountChartHandler),
        new GetAccountChartsRouteProvider(getAccountChartsHandler),
        new GetAccountChartDetailsRouteProvider(getAccountChartDetailsHandler),
        new GetChartForPeriodRouteProvider(getChartForPeriodHandler),
        new GetGeneratedChartsRouteProvider(getGeneratedChartsHandler),
        new PutAccountChartRouteProvider(putAccountChartsHandler),
    ];
}