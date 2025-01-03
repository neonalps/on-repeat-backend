import { isDefined, isNotDefined, removeNull, requireNonNull } from "@src/util/common";
import { PlayedTrackMapper } from "./mapper";
import { validateNotNull, validateTrue } from "@src/util/validation";
import { PlayedTrackDao } from "@src/models/classes/dao/played-track";
import { CreatePlayedTrackDto } from "@src/models/classes/dto/create-played-track";
import { PlayedInfoDao } from "@src/models/classes/dao/played-info";
import { PaginationParams, SortOrder } from "@src/modules/pagination/constants";
import { PlayedTrackDetailsDao } from "@src/models/classes/dao/played-track-details";
import { DateUtils } from "@src/util/date";
import { ChartItem } from "@src/models/interface/chart-item";
import { PlayedInfoItem } from "@src/models/interface/played-info-item";
import { ArtistPlayedTrackDetailsDao } from "@src/models/classes/dao/artist-track-played";
import { CatalogueService } from "@src/modules/catalogue/service";
import { PlayedTrackHistoryDao } from "@src/models/classes/dao/played-track-history";
import { IdNameDao } from "@src/models/classes/dao/id-name";
import { SimpleAlbumDao } from "@src/models/classes/dao/album-simple";
import { AlbumDao } from "@src/models/classes/dao/album";
import { PlayedStatsDao } from "@src/models/classes/dao/played-stats";
import { SimpleArtistDao } from "@src/models/classes/dao/artist-simple";
import { ArtistDao } from "@src/models/classes/dao/artist";
import { PlayedTrackDetailsNoAlbumImagesDao } from "@src/models/classes/dao/played-track-details-no-album-images";

export interface GetPlayedTracksPaginationParams extends PaginationParams<Date> {
    from?: Date,
    to?: Date,
};
export interface GetPlayedTrackHistoryPaginationParams extends PaginationParams<Date> {};

export interface GetArtistPlayedTracksPaginationParams extends PaginationParams<number> {
    sortBy: GetArtistPlayedTracksSortKey,
};

export enum GetArtistPlayedTracksSortKey {
    TIMES_PLAYED = 'TIMES_PLAYED',
};

export class PlayedTrackService {

    static readonly EMPTY_PLAYED_INFO = PlayedInfoDao.Builder
        .withFirstPlayedAt(null)
        .withLastPlayedAt(null)
        .withTimesPlayed(0)
        .build();

    private readonly catalogueService: CatalogueService;
    private readonly mapper: PlayedTrackMapper;

    constructor(catalogueService: CatalogueService, mapper: PlayedTrackMapper) {
        this.catalogueService = requireNonNull(catalogueService);
        this.mapper = requireNonNull(mapper);
    }

    public async create(dto: CreatePlayedTrackDto): Promise<PlayedTrackDao | null> {
        validateNotNull(dto, "dto");
        validateNotNull(dto.accountId, "dto.accountId");
        validateNotNull(dto.trackId, "dto.trackId");
        validateNotNull(dto.musicProviderId, "dto.musicProviderId");
        validateNotNull(dto.playedAt, "dto.playedAt");
        validateNotNull(dto.includeInStatistics, "dto.includeInStatistics");

        const createdPlayedTrackId = await this.mapper.create(dto);

        if (!createdPlayedTrackId) {
            throw new Error("failed to create played track");
        }

        return this.getById(createdPlayedTrackId);
    }

    public async getById(id: number): Promise<PlayedTrackDao | null> {
        validateNotNull(id, "id");

        return this.mapper.getById(id);
    }

    public async getByAccountIdAndPlayedTrackId(accountId: number, playedTrackId: number): Promise<PlayedTrackDao | null> {
        validateNotNull(accountId, "accountId");
        validateNotNull(playedTrackId, "playedTrackId");

        return this.mapper.getByAccountIdAndPlayedTrackId(accountId, playedTrackId);
    }

    public async getAllForAccountPaginated(accountId: number, paginationParams: GetPlayedTracksPaginationParams): Promise<PlayedTrackDetailsDao[]> {
        validateNotNull(accountId, "accountId");
        validateNotNull(paginationParams, "paginationParams");
        validateNotNull(paginationParams.limit, "paginationParams.limit");
        validateNotNull(paginationParams.order, "paginationParams.order");
        validateNotNull(paginationParams.lastSeen, "paginationParams.lastSeen");

        const orderedIds = await this.getAllOrderedPaginatedResult(accountId, paginationParams.lastSeen, paginationParams.from, paginationParams.to, paginationParams.limit, paginationParams.order);

        const playedTrackDetails = await this.mapper.getAllForAccountPaginatedDetails(orderedIds);
        const playedTrackDetailsWithAlbumImages = await this.loadPlayedTrackDetailsWithArtistImages(playedTrackDetails);
        return playedTrackDetailsWithAlbumImages.sort(PlayedTrackService.playedAtComparator(paginationParams.order));
    }

    public async updateById(playedTrackId: number, includeInStatistics: boolean): Promise<PlayedTrackDetailsDao> {
        validateNotNull(playedTrackId, "playedTrackId");
        validateNotNull(includeInStatistics, "includeInStatistics");

        await this.mapper.updateById(playedTrackId, includeInStatistics);

        const updatedTrack = await this.getById(playedTrackId);
        if (isNotDefined(updatedTrack)) {
            throw new Error(`Cannot update played track with ID ${playedTrackId} because it doesn't exist`);
        }

        const playedTrackDetails = await this.mapper.getAllForAccountPaginatedDetails([(updatedTrack as PlayedTrackDao).id]);
        const playedTrackDetailsWithAlbumImages = await this.loadPlayedTrackDetailsWithArtistImages(playedTrackDetails);
        if (playedTrackDetailsWithAlbumImages.length !== 1) {
            throw new Error(`Illegal state - there must only be one played track at this point, but there are not for ID ${playedTrackId}`);
        }

        return playedTrackDetailsWithAlbumImages[0];
    }

    public async getMultiplePlayedTrackDetailsById(playedTrackIds: number[]): Promise<PlayedTrackDetailsDao[]> {
        validateNotNull(playedTrackIds, "playedTrackIds");
        
        if (playedTrackIds.length === 0) {
            return [];
        }

        const playedTrackDetails = await this.mapper.getAllForAccountPaginatedDetails(playedTrackIds);
        const playedTrackDetailsWithAlbumImages = await this.loadPlayedTrackDetailsWithArtistImages(playedTrackDetails);
        return playedTrackDetailsWithAlbumImages.sort(PlayedTrackService.playedAtComparator(SortOrder.ASCENDING));
    }

    public async getPlayedTrackHistoryForAccountPaginated(accountId: number, trackId: number, paginationParams: GetPlayedTrackHistoryPaginationParams): Promise<PlayedTrackHistoryDao[]> {
        validateNotNull(accountId, "accountId");
        validateNotNull(trackId, "trackId");
        validateNotNull(paginationParams, "paginationParams");
        validateNotNull(paginationParams.limit, "paginationParams.limit");
        validateNotNull(paginationParams.order, "paginationParams.order");
        validateNotNull(paginationParams.lastSeen, "paginationParams.lastSeen");

        const track = await this.catalogueService.getTrackById(trackId);
        if (track === null) {
            throw new Error(`Played track history requested for track ${trackId} but it doesn't exist`);
        }

        return this.mapper.getPlayedTrackHistoryForAccountPaginated(accountId, track.bucket, null, null, paginationParams.lastSeen, paginationParams.limit, paginationParams.order);
    }

    public async getArtistTracksOffsetPaginated(accountId: number, artistId: number, paginationParams: GetArtistPlayedTracksPaginationParams): Promise<ArtistPlayedTrackDetailsDao[]> {
        validateNotNull(accountId, "accountId");
        validateNotNull(artistId, "artistId");
        validateNotNull(paginationParams, "paginationParams");
        validateNotNull(paginationParams.limit, "paginationParams.limit");
        validateNotNull(paginationParams.sortBy, "paginationParams.sortBy");
        validateNotNull(paginationParams.order, "paginationParams.order");
        validateNotNull(paginationParams.lastSeen, "paginationParams.lastSeen");

        const orderedTrackBuckets = await this.getArtistTracksOrderedOffsetPaginatedResult(accountId, artistId, paginationParams.lastSeen, paginationParams.limit, paginationParams.sortBy, paginationParams.order);

        const result: ArtistPlayedTrackDetailsDao[] = [];

        for (const trackBucket of orderedTrackBuckets) {
            const trackDetails = await this.catalogueService.getSimpleTrackDetailsById(trackBucket.itemId);

            if (!trackDetails) {
                continue;
            }

            const additionalArtists = Array.from(trackDetails.artists).filter(artist => artist.id !== artistId);
            
            const item = ArtistPlayedTrackDetailsDao.Builder
                .withTrack(trackDetails.track)
                .withAlbum(trackDetails.album)
                .withAdditionalArtists(additionalArtists)
                .withTimesPlayed(trackBucket.timesPlayed)
                .build();

            result.push(item);
        }

        return result;
    }

    private async getAllOrderedPaginatedResult(accountId: number, lastSeenPlayedAt: Date, from: Date | undefined, to: Date | undefined, limit: number, order: SortOrder): Promise<number[]> {
        return this.mapper.getAllIdsForAccountPaginated(accountId, lastSeenPlayedAt, from, to, limit, order);
    }

    private async getArtistTracksOrderedOffsetPaginatedResult(accountId: number, artistId: number, lastSeen: number, limit: number, sortBy: GetArtistPlayedTracksSortKey, order: SortOrder): Promise<PlayedInfoItem[]> {
        return this.mapper.getArtistTrackBucketsOrderedOffsetPaginatedResult(accountId, artistId, null, null, lastSeen, limit, sortBy, order);
    }

    public async hasPlayedTrackAlreadyBeenProcessed(accountId: number, musicProviderId: number, playedAt: Date): Promise<boolean> {
        validateNotNull(accountId, "accountId");
        validateNotNull(musicProviderId, "musicProviderId");
        validateNotNull(playedAt, "playedAt");
    
        const playedTrack = await this.mapper.getByAccountIdAndMusicProviderIdAndPlayedAt(accountId, musicProviderId, playedAt);
        return playedTrack !== null;
    }

    public async getMostRecentPlayedTrackByAccountAndMusicProvider(accountId: number, musicProviderId: number): Promise<PlayedTrackDao | null> {
        validateNotNull(accountId, "accountId");
        validateNotNull(musicProviderId, "musicProviderId");

        return this.mapper.getMostRecentPlayedTrackByAccountAndMusicProvider(accountId, musicProviderId);
    }

    public async getPlayedInfoForAlbum(accountId: number, albumId: number): Promise<PlayedInfoDao> {
        validateNotNull(accountId, "accountId");
        validateNotNull(albumId, "albumId");

        const playedInfo = await this.mapper.getPlayedInfoForAlbum(accountId, albumId); 

        if (playedInfo === null) {
            return PlayedTrackService.EMPTY_PLAYED_INFO;
        }

        return playedInfo;
    }

    public async getPlayedInfoForArtist(accountId: number, artistId: number): Promise<PlayedInfoDao> {
        validateNotNull(accountId, "accountId");
        validateNotNull(artistId, "artistId");

        const playedInfo = await this.mapper.getPlayedInfoForArtist(accountId, artistId); 

        if (playedInfo === null) {
            return PlayedTrackService.EMPTY_PLAYED_INFO;
        }

        return playedInfo;
    }

    public async getPlayedInfoForTrack(accountId: number, trackId: number): Promise<PlayedInfoDao> {
        validateNotNull(accountId, "accountId");
        validateNotNull(trackId, "trackId");

        const track = await this.catalogueService.getTrackById(trackId);
        if (track === null) {
            throw new Error(`Played info requested for track ${trackId} but it doesn't exist`);
        }

        const playedInfo = await this.mapper.getPlayedInfoForTrack(accountId, track.bucket); 
        if (playedInfo === null) {
            return PlayedTrackService.EMPTY_PLAYED_INFO;
        }

        return playedInfo;
    }

    public async getPlayedInfoForAccount(accountId: number): Promise<PlayedInfoDao> {
        validateNotNull(accountId, "accountId");

        const playedInfo = await this.mapper.getPlayedInfoForAccount(accountId); 
        if (playedInfo === null) {
            return PlayedTrackService.EMPTY_PLAYED_INFO;
        }

        return playedInfo;
    }

    public getAccountTrackChartsForPeriod(accountId: number, from: Date | null, to: Date | null, limit: number): Promise<ChartItem[]> {
        validateNotNull(accountId, "accountId");
        validateNotNull(limit, "limit");

        return this.mapper.getAccountTrackChartBucketIdsForPeriod(accountId, from, to, limit);
    }

    public getAccountArtistChartsForPeriod(accountId: number, from: Date | null, to: Date | null, limit: number): Promise<ChartItem[]> {
        validateNotNull(accountId, "accountId");
        validateNotNull(limit, "limit");

        return this.mapper.getAccountArtistChartForPeriod(accountId, from, to, limit);
    }

    public getPlayedTrackStatsForPeriod(accountId: number, from: Date | null, to: Date | null): Promise<PlayedStatsDao> {
        validateNotNull(accountId, "accountId");

        return this.mapper.getPlayedTrackStatsForPeriod(accountId, from, to);
    }

    public updateIncludeInStatisticsForPeriod(accountId: number, from: Date, to: Date, includeInStatistics: boolean): Promise<number[]> {
        validateNotNull(accountId, "accountId");
        validateNotNull(from, "from");
        validateNotNull(to, "to");
        validateNotNull(includeInStatistics, "includeInStatistics");
        validateTrue(from < to, "from must be before to");

        return this.mapper.updateIncludeInStatisticsForPeriod(accountId, from, to, includeInStatistics);
    }

    private static playedAtComparator(sortOrder: SortOrder): ((a: PlayedTrackDetailsDao, b: PlayedTrackDetailsDao) => number) | undefined {
        return (a, b) => {
            const first = DateUtils.getUnixTimestampFromDate(a.playedAt);
            const second = DateUtils.getUnixTimestampFromDate(b.playedAt);

            if (sortOrder === SortOrder.ASCENDING) {
                return first - second;
            }

            return second - first;
        };
    }

    private mapToPlayedTrackDetailsDao(
        item: PlayedTrackDetailsNoAlbumImagesDao, 
        artists: ArtistDao[],  
        albums: AlbumDao[],
    ): PlayedTrackDetailsDao {
        let album: SimpleAlbumDao | null = null;
        if (isDefined(item.album)) {
            const albumIdName = item.album as IdNameDao;

            const albumDao = albums.find(albumItem => albumItem.id === albumIdName.id);
            const albumImages = isDefined(albumDao) ? (albumDao as AlbumDao).images : [];

            album = SimpleAlbumDao.Builder
                .withId(albumIdName.id)
                .withName(albumIdName.name)
                .withImages(albumImages)
                .build();
        }

        const trackArtists: SimpleArtistDao[] = [];
        for (const trackArtistItem of item.artists) {
            const trackArtist = artists.find(artist => artist.id === trackArtistItem.id);
            if (isNotDefined(trackArtist)) {
                continue;
            }

            trackArtists.push(
                SimpleArtistDao.Builder
                    .withId((trackArtist as ArtistDao).id)
                    .withName((trackArtist as ArtistDao).name)
                    .withImages((trackArtist as ArtistDao).images)
                    .build()
            );
        }

        return PlayedTrackDetailsDao.Builder
            .withPlayedTrackId(item.playedTrackId)
            .withPlayedAt(item.playedAt)
            .withTrack(item.track)
            .withArtists(trackArtists)
            .withAlbum(album)
            .withMusicProvider(item.musicProvider)
            .withIncludeInStatistics(item.includeInStatistics)
            .build();
    }

    private async loadPlayedTrackDetailsWithArtistImages(playedTrackDetails: PlayedTrackDetailsNoAlbumImagesDao[]): Promise<PlayedTrackDetailsDao[]> {
        if (playedTrackDetails.length === 0) {
            return [];
        }

        const albumIds = playedTrackDetails
            .map(item => item.album?.id)
            .filter(item => isDefined(item)) as number[];

        const artistIds = new Set<number>();
        for (const playedTrack of playedTrackDetails) {
            playedTrack.artists.forEach(artist => artistIds.add(artist.id));
        }

        const artists = await this.catalogueService.getMultipleArtistsById(Array.from(artistIds));
        const albums = await this.catalogueService.getMultipleAlbumsById(albumIds);

        return playedTrackDetails.map(item => this.mapToPlayedTrackDetailsDao(item, artists, albums));
    }

}