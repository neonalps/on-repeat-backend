import { AccountChartApiDto } from "@src/models/api/account-chart";
import { AccountChartItemApiDto } from "@src/models/api/account-chart-item";

export interface AccountChartDetailsApiDto<T> {
    accountChart: AccountChartApiDto;
    items: AccountChartItemApiDto<T>[];
}