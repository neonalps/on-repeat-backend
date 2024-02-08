import { PlayedTrackService } from "@src/modules/played-tracks/service";
import { isNotDefined, removeNull, requireNonNull } from "@src/util/common";
import { validateNotBlank, validateNotNull, validateTrue } from "@src/util/validation";
import { CatalogueService } from "@src/modules/catalogue/service";
import { TrackDao } from "@src/models/classes/dao/track";
import logger from "@src/log/logger";
import { ApiHelper } from "@src/api/helper";
import { ArtistApiDto } from "@src/models/api/artist";
import { ChartItem } from "@src/models/interface/chart-item";
import { PaginationParams } from "@src/modules/pagination/constants";
import { AccountChartDao } from "@src/models/classes/dao/account-chart";
import { ChartMapper } from "@src/modules/chart/mapper";
import { AccountChartDetailsDao } from "@src/models/classes/dao/account-chart-details";
import { AccountChartItemApiDto } from "@src/models/api/account-chart-item";
import { TrackApiDto } from "@src/models/api/track";
import { TrackChartItemDao } from "@src/models/classes/dao/track-chart-item";
import { ArtistTrackChartItemDao } from "@src/models/classes/dao/artist-track-chart-item";

export interface GetAccountChartsPaginationParams extends PaginationParams<Date> {};

export class ChartService {

    private static readonly CHART_DEFAULT_LIMIT = 10;
    private static readonly ACCOUNT_TRACK_CHART_MAX_LIMIT = 100;
    private static readonly ACCOUNT_ARTIST_CHART_MAX_LIMIT = 100;

    private readonly apiHelper: ApiHelper;
    private readonly catalogueService: CatalogueService;
    private readonly mapper: ChartMapper;
    private readonly playedTrackService: PlayedTrackService;

    constructor(
        apiHelper: ApiHelper, 
        catalogueService: CatalogueService, 
        mapper: ChartMapper,
        playedTrackService: PlayedTrackService
    ) {
        this.apiHelper = requireNonNull(apiHelper);
        this.catalogueService = requireNonNull(catalogueService);
        this.mapper = requireNonNull(mapper);
        this.playedTrackService = requireNonNull(playedTrackService);
    }

    public async getAdHocAccountTrackChartsForPeriod(accountId: number, from: Date | null, to: Date | null, limit: number = ChartService.CHART_DEFAULT_LIMIT): Promise<AccountChartItemApiDto<TrackApiDto>[]> {
        validateNotNull(accountId, "accountId");
        validateTrue(limit <= ChartService.ACCOUNT_TRACK_CHART_MAX_LIMIT, `limit must not be larger than ${ChartService.ACCOUNT_TRACK_CHART_MAX_LIMIT}`);

        if (from !== null && to !== null) {
            validateTrue(from < to, "from must be before to");
        }

        const chartItems = await this.playedTrackService.getAccountTrackChartsForPeriod(accountId, from, to, limit);
        
        const trackIds = chartItems.map((item: ChartItem) => item.itemId);

        const trackDaos = await this.catalogueService.getMultipleTracksById(new Set(trackIds));

        const albumIds = trackDaos.map((track: TrackDao) => track.albumId).filter(removeNull) as number[];
        const artistIds = trackDaos.flatMap((track: TrackDao) => [...track.artistIds]);

        const [artistDaos, albumDaos] = await Promise.all([
            this.catalogueService.getMultipleArtistsById(artistIds),
            this.catalogueService.getMultipleAlbumsById(albumIds),
        ]);

        return chartItems.map(chartItem => {
            const bucketId = chartItem.itemId;
            const track = trackDaos.find(track => track.id === bucketId);

            if (!track) {
                logger.error(`Illegal state; track with bucket ID ${bucketId} was found in charts but not in DAOs`);
                return null;
            }

            const album = albumDaos.find(album => album.id === track.albumId);
            const artists = artistDaos.filter(artist => track.artistIds.indexOf(artist.id) >= 0);

            return {
                place: chartItem.rank,
                item: this.apiHelper.convertTrackApiDto(track, artists, album),
                playCount: chartItem.timesPlayed,
            }
        }).filter(removeNull) as AccountChartItemApiDto<TrackApiDto>[];
    }

    public async getAdHocAccountArtistChartsForPeriod(accountId: number, from: Date | null, to: Date | null, limit: number = ChartService.CHART_DEFAULT_LIMIT): Promise<AccountChartItemApiDto<ArtistApiDto>[]> {
        validateNotNull(accountId, "accountId");
        validateTrue(limit <= ChartService.ACCOUNT_ARTIST_CHART_MAX_LIMIT, `limit must not be larger than ${ChartService.ACCOUNT_ARTIST_CHART_MAX_LIMIT}`);

        if (from !== null && to !== null) {
            validateTrue(from < to, "from must be before to");
        }

        const chartItems = await this.playedTrackService.getAccountArtistChartsForPeriod(accountId, from, to, limit);
        
        const artistIds = chartItems.map((item: ChartItem) => item.itemId);

        const artistDaos = await this.catalogueService.getMultipleArtistsById(artistIds);

        return chartItems.map(chartItem => {
            const artistId = chartItem.itemId;
            const artist = artistDaos.find(artist => artist.id === artistId);

            if (!artist) {
                logger.error(`Illegal state; artist with ID ${artistId} was found in charts but not in DAOs`);
                return null;
            }

            return {
                place: chartItem.rank,
                item: this.apiHelper.convertArtistApiDto(artist) as ArtistApiDto,
                playCount: chartItem.timesPlayed,
            }
        }).filter(removeNull) as AccountChartItemApiDto<ArtistApiDto>[];
    }

    public async getAccountChartsPaginated(accountId: number, paginationParams: GetAccountChartsPaginationParams): Promise<AccountChartDao[]> {
        validateNotNull(accountId, "accountId");
        validateNotNull(paginationParams, "paginationParams");
        validateNotNull(paginationParams.limit, "paginationParams.limit");
        validateNotNull(paginationParams.order, "paginationParams.order");
        validateNotNull(paginationParams.lastSeen, "paginationParams.lastSeen");

        return this.mapper.getAccountChartsPaginated(accountId, paginationParams.lastSeen, paginationParams.limit, paginationParams.order);
    }

    public async getAccountChartDetails(chartId: number): Promise<AccountChartDetailsDao | null> {
        validateNotNull(chartId, "chartId");

        const accountChart = await this.mapper.getAccountChartById(chartId);
        if (isNotDefined(accountChart)) {
            return null;
        }

        const details = await this.mapper.getAccountTrackChartDetails(chartId);

        return AccountChartDetailsDao.Builder
            .withChart(accountChart as AccountChartDao)
            .withItems(details)
            .build();
    }

    public async getEntriesForTrack(trackId: number): Promise<TrackChartItemDao[]> {
        validateNotNull(trackId, "trackId");

        return this.mapper.getEntriesForTrack(trackId);
    }

    public async getTrackEntriesForArtist(artistId: number): Promise<ArtistTrackChartItemDao[]> {
        validateNotNull(artistId, "artistId");

        return this.mapper.getTrackEntriesForArtist(artistId);
    }

    public async fullTextSearch(input: string): Promise<AccountChartDao[]> {
        validateNotBlank(input, "input");

        return this.mapper.fullTextSearch(input);
    }

}