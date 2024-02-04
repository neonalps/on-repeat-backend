import { ChartApiDto } from "@src/models/api/chart"
import { PlayedStatsApiDto } from "@src/models/api/played-stats"
import { AccountChartItemApiDto } from "./account-chart-item"

export interface BasicDashboardInformationApiDto {
    charts: {
        tracks: {
            allTime: ChartApiDto<AccountChartItemApiDto<unknown>>,
            current: ChartApiDto<AccountChartItemApiDto<unknown>>,
        },
        artists: {
            allTime: ChartApiDto<AccountChartItemApiDto<unknown>>,
            current: ChartApiDto<AccountChartItemApiDto<unknown>>,
        },
    },
    stats: {
        playedTracks: {
            allTime: PlayedStatsApiDto,
            current: PlayedStatsApiDto,
        },
    },
}