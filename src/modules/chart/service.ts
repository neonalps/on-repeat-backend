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
import { ArtistDao } from "@src/models/classes/dao/artist";
import { AlbumDao } from "@src/models/classes/dao/album";
import { IllegalStateError } from "@src/api/error/illegal-state-error";
import { AccountChartDetailsApiDto } from "@src/models/api/account-chart-details";

export interface GetAccountChartsPaginationParams extends PaginationParams<Date> {};

export interface CreateAccountChartRequest {
    accountId: number;
    name: string;
    type: string;
    from: Date;
    to: Date;
}

export interface UpdateAccountChartRequest {
    accountChartId: number;
    name: string;
    type: string;
    from: Date;
    to: Date;
    items: AccountChartItem[];
}

export interface AccountChartItem {
    itemId: number;
    place: number;
}

export class ChartService {

    static readonly ERROR_CHART_NOT_FOUND = "No chart with this ID exists";

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

    public async checkAccountChartExists(accountId: number, accountChartId: number): Promise<boolean> {
        validateNotNull(accountId, "accountId");
        validateNotNull(accountChartId, "accountChartId");

        return this.mapper.checkAccountChartExists(accountId, accountChartId);
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

        const track = await this.catalogueService.getTrackById(trackId);
        if (!track) {
            return [];
        }

        return this.mapper.getEntriesForTrackBucket(track.bucket);
    }

    public async getTrackEntriesForArtist(accountId: number, artistId: number): Promise<ArtistTrackChartItemDao[]> {
        validateNotNull(accountId, "accountId");
        validateNotNull(artistId, "artistId");

        return this.mapper.getTrackEntriesForArtist(accountId, artistId);
    }

    public async fullTextSearch(input: string): Promise<AccountChartDao[]> {
        validateNotBlank(input, "input");

        return this.mapper.fullTextSearch(input);
    }

    public async createAccountChart(request: CreateAccountChartRequest): Promise<AccountChartDetailsApiDto<unknown>> {
        validateNotNull(request, "request");
        validateNotNull(request.accountId, "request.accountId");
        validateNotBlank(request.name, "request.name");
        validateNotBlank(request.type, "request.type");
        validateNotNull(request.from, "request.from");
        validateNotNull(request.to, "request.to");
        validateTrue(request.from < request.to, "from must be before to");

        const accountChartId = await this.mapper.createAccountChart(request);
        return this.loadAccountChartDetails(accountChartId);
    }

    public async updateAccountChart(request: UpdateAccountChartRequest): Promise<AccountChartDetailsApiDto<unknown>> {
        validateNotNull(request, "request");
        validateNotNull(request.accountChartId, "request.accountChartId");
        validateNotBlank(request.name, "request.name");
        validateNotBlank(request.type, "request.type");
        validateNotNull(request.from, "request.from");
        validateNotNull(request.to, "request.to");
        validateTrue(request.from < request.to, "from must be before to");

        await this.mapper.putAccountChart(request);
        return this.loadAccountChartDetails(request.accountChartId);
    }

    public async loadAccountChartDetails(chartId: number): Promise<AccountChartDetailsApiDto<unknown>> {
        const accountChartDetails = await this.getAccountChartDetails(chartId);
        if (isNotDefined(accountChartDetails)) {
            throw new IllegalStateError(ChartService.ERROR_CHART_NOT_FOUND);
        }

        const accountChartDetailsItems = (accountChartDetails as AccountChartDetailsDao).items;

        const trackIds = new Set((accountChartDetails as AccountChartDetailsDao).items.map(item => item.itemId));
        const tracks = await this.catalogueService.getMultipleTracksById(trackIds);

        const artistIds = new Set(tracks.map(item => item.artistIds).flat());
        const artists = await this.catalogueService.getMultipleArtistsById(Array.from(artistIds));
        
        const albumIds = new Set(tracks.filter(removeNull).map(item => item.albumId).flat()) as Set<number>;
        const albums = await this.catalogueService.getMultipleAlbumsById(Array.from(albumIds));

        const items: AccountChartItemApiDto<TrackApiDto>[] = [];
        for (const item of accountChartDetailsItems) {
            const track = tracks.find(t => item.itemId === t.id);
            if (!track) {
                continue;
            }

            const trackArtists = track.artistIds.map(id => artists.find(a => a.id === id)) as ArtistDao[];
            const trackAlbum = track.albumId !== null ? albums.find(a => a.id === track.albumId) as AlbumDao : undefined;

            items.push({
                place: item.place,
                playCount: item.playCount,
                item: this.apiHelper.convertTrackApiDto(track, trackArtists, trackAlbum),
            });
        }

        return {
            accountChart: this.apiHelper.convertAccountChartApiDto((accountChartDetails as AccountChartDetailsDao).chart),
            items,
        }
    }

}