
import { AuthenticationContext, RouteHandler } from "@src/router/types";
import { requireNonNull } from "@src/util/common";
import { MusicProviderService } from "@src/modules/music-provider/service";
import { PlayedTrackService } from "@src/modules/played-tracks/service";
import { AccountDao } from "@src/models/classes/dao/account";
import { IllegalStateError } from "@src/api/error/illegal-state-error";
import { ApiHelper } from "@src/api/helper";
import { CatalogueService } from "@src/modules/catalogue/service";
import { GetTrackByIdRequestDto } from "@src/models/api/get-track-by-id-request";
import { DetailedTrackApiDto } from "@src/models/api/detailed-track";
import { ChartService } from "@src/modules/chart/service";

export class GetTrackByIdHandler implements RouteHandler<GetTrackByIdRequestDto, DetailedTrackApiDto> {

    static readonly ERROR_TRACK_NOT_FOUND = "No track with this ID exists";

    private readonly apiHelper: ApiHelper;
    private readonly catalogueService: CatalogueService;
    private readonly chartService: ChartService;
    private readonly musicProviderService: MusicProviderService;
    private readonly playedTrackService: PlayedTrackService;
    
    constructor(
        apiHelper: ApiHelper,
        catalogueService: CatalogueService,
        chartService: ChartService,
        musicProviderService: MusicProviderService, 
        playedTrackService: PlayedTrackService,
    ) {
        this.apiHelper = requireNonNull(apiHelper);
        this.catalogueService = requireNonNull(catalogueService);
        this.chartService = requireNonNull(chartService);
        this.musicProviderService = requireNonNull(musicProviderService);
        this.playedTrackService = requireNonNull(playedTrackService);
    }
    
    public async handle(context: AuthenticationContext, dto: GetTrackByIdRequestDto): Promise<DetailedTrackApiDto> {
        const accountId = (context.account as AccountDao).id;
        const trackId = dto.trackId;
        const track = await this.catalogueService.getTrackById(trackId);

        if (!track) {
            throw new IllegalStateError(GetTrackByIdHandler.ERROR_TRACK_NOT_FOUND);
        }

        const [externalUrls, playedInfo, album, artists, chartEntries, releaseDate] = await Promise.all([
            this.musicProviderService.getExternalUrlsForTrack(trackId),
            this.playedTrackService.getPlayedInfoForTrack(accountId, trackId),
            this.catalogueService.getAlbumById(track.albumId),
            this.catalogueService.getMultipleArtistsById(track.artistIds),
            this.chartService.getEntriesForTrack(trackId),
            this.catalogueService.getTrackReleaseDate(trackId),
        ]);

        const artistsApiDtos = artists.map(artist => {
            return {
                id: artist.id,
                name: artist.name,
                href: this.apiHelper.getArtistResourceUrl(artist.id),
                images: this.apiHelper.convertImageApiDtos(artist.images),
            };
        });

        const albumApiDto = album !== null ? {
            id: album.id,
            name: album.name,
            href: this.apiHelper.getAlbumResourceUrl(album.id),
            images: this.apiHelper.convertImageApiDtos(Array.from(album.images)),
        } : null;

        const releaseDateApiDto = releaseDate !== null ? {
            releaseDate: releaseDate.releaseDate,
            precision: releaseDate.precision,
        } : null;

        return {
            id: track.id,
            name: track.name,
            artists: artistsApiDtos,
            album: albumApiDto,
            externalUrls,
            playedInfo: { 
                firstPlayedAt: playedInfo.firstPlayedAt,
                lastPlayedAt: playedInfo.lastPlayedAt,
                timesPlayed: playedInfo.timesPlayed,
            },
            explicit: track.explicit,
            isrc: track.isrc,
            discNumber: track.discNumber,
            trackNumber: track.trackNumber,
            durationMs: track.durationMs,
            charts: this.apiHelper.convertTrackChartEntries(chartEntries),
            releaseDate: releaseDateApiDto,
        }
    }

}