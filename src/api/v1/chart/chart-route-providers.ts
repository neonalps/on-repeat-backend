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
import { CatalogueService } from "@src/modules/catalogue/service";

export const getChartApiRouteProviders = () => {
    const apiHelper = dependencyManager.get<ApiHelper>(Dependencies.ApiHelper);
    const catalogueService = dependencyManager.get<CatalogueService>(Dependencies.CatalogueService);
    const chartService = dependencyManager.get<ChartService>(Dependencies.ChartService);
    const paginationService = dependencyManager.get<PaginationService>(Dependencies.PaginationService);

    const getAccountChartsHandler = new GetAccountChartsHandler(apiHelper, chartService, paginationService);
    const getAccountChartDetailsHandler = new GetAccountChartDetailsHandler(apiHelper, catalogueService, chartService);
    const getChartForPeriodHandler = new GetChartForPeriodHandler(chartService);

    return [
        new GetAccountChartsRouteProvider(getAccountChartsHandler),
        new GetAccountChartDetailsRouteProvider(getAccountChartDetailsHandler),
        new GetChartForPeriodRouteProvider(getChartForPeriodHandler),
    ];
}