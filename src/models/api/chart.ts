import { ChartPeriodStats } from "@src/models/api/chart-period-stats";

export interface ChartApiDto<T> {
    type: string;
    from?: Date;
    to?: Date;
    stats?: ChartPeriodStats;
    items: T[];
}