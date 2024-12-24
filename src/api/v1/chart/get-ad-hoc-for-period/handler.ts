import { AccountChartItemApiDto } from "@src/models/api/account-chart-item";
import { ChartApiDto } from "@src/models/api/chart";
import { CreateChartsForPeriodRequestDto } from "@src/models/api/create-charts-for-period-request";
import { AccountDao } from "@src/models/classes/dao/account";
import { CHART_TYPE_ARTISTS, CHART_TYPE_TRACKS } from "@src/modules/chart/constants";
import { ChartService } from "@src/modules/chart/service";
import { PlayedTrackService } from "@src/modules/played-tracks/service";
import { AuthenticationContext, RouteHandler } from "@src/router/types";
import { isDefined, requireNonNull } from "@src/util/common";

export class GetChartForPeriodHandler implements RouteHandler<CreateChartsForPeriodRequestDto, ChartApiDto<AccountChartItemApiDto<unknown>>> {

    private readonly chartService: ChartService;
    private readonly playedTrackService: PlayedTrackService;

    constructor(chartService: ChartService, playedTrackService: PlayedTrackService) {
        this.chartService = requireNonNull(chartService);
        this.playedTrackService = requireNonNull(playedTrackService);
    }

    public async handle(context: AuthenticationContext, dto: CreateChartsForPeriodRequestDto): Promise<ChartApiDto<AccountChartItemApiDto<unknown>>> {
        const accountId = (context.account as AccountDao).id;
        
        const type = isDefined(dto.type) ? dto.type : CHART_TYPE_TRACKS;
        const from = isDefined(dto.from) ? new Date(dto.from) : null;
        const to = isDefined(dto.to) ? new Date(dto.to) : null;
        const limit = isDefined(dto.limit) ? dto.limit : 10;

        if (limit < 1 || limit > 100) {
            throw new Error(`Limit must be between 1 and 100`);
        }

        const [items, stats] = await Promise.all([
            this.getChartItems(type, accountId, from, to, limit),
            this.playedTrackService.getPlayedTrackStatsForPeriod(accountId, from, to),
        ])

        let response: ChartApiDto<AccountChartItemApiDto<unknown>>;
        response = {
            type,
            items,
            stats: {
                tracksPlayed: stats.timesPlayed,
            }
        };

        if (from !== null) {
            response = { from, ...response };
        }

        if (to !== null) {
            response = { to, ...response };
        }

        return response;
    }

    private getChartItems(type: string, accountId: number, from: Date | null, to: Date | null, limit: number): Promise<AccountChartItemApiDto<unknown>[]> {
        switch (type) {
            case CHART_TYPE_ARTISTS:
                return this.chartService.getAdHocAccountArtistChartsForPeriod(accountId, from, to, limit);
            case CHART_TYPE_TRACKS:
                return this.chartService.getAdHocAccountTrackChartsForPeriod(accountId, from, to, limit);
            default:
                throw new Error(`Illegal state: unknown chart type ${type}`);
        }
    }

}