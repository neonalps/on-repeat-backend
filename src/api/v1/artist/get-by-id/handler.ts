import { AuthenticationContext, RouteHandler } from "@src/router/types";
import { requireNonNull } from "@src/util/common";
import { GetArtistByIdRequestDto } from "@src/models/api/get-artist-by-id-request";
import { DetailedArtistApiDto, DetailedArtistChartApiDto } from "@src/models/api/detailed-artist";
import { MusicProviderService } from "@src/modules/music-provider/service";
import { PlayedTrackService } from "@src/modules/played-tracks/service";
import { AccountDao } from "@src/models/classes/dao/account";
import { IllegalStateError } from "@src/api/error/illegal-state-error";
import { CatalogueService } from "@src/modules/catalogue/service";
import { ApiHelper } from "@src/api/helper";
import { ChartService } from "@src/modules/chart/service";

export class GetArtistByIdHandler implements RouteHandler<GetArtistByIdRequestDto, DetailedArtistApiDto> {

    static readonly ERROR_ARTIST_NOT_FOUND = "No artist with this ID exists";

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
        playedTrackService: PlayedTrackService
    ) {
        this.apiHelper = requireNonNull(apiHelper);
        this.catalogueService = requireNonNull(catalogueService);
        this.chartService = requireNonNull(chartService);
        this.musicProviderService = requireNonNull(musicProviderService);
        this.playedTrackService = requireNonNull(playedTrackService);
    }
    
    public async handle(context: AuthenticationContext, dto: GetArtistByIdRequestDto): Promise<DetailedArtistApiDto> {
        const accountId = (context.account as AccountDao).id;
        const artistId = dto.artistId;
        const artist = await this.catalogueService.getArtistById(artistId);

        if (!artist) {
            throw new IllegalStateError(GetArtistByIdHandler.ERROR_ARTIST_NOT_FOUND);
        }

        const [externalUrls, playedInfo, chartEntries] = await Promise.all([
            this.musicProviderService.getExternalUrlsForArtist(artistId),
            this.playedTrackService.getPlayedInfoForArtist(accountId, artistId),
            this.chartService.getTrackEntriesForArtist(accountId, artistId),
        ]);

        const tracks = await this.catalogueService.getMultipleTracksById(new Set(chartEntries.map(entry => entry.trackId)));

        const chartEntryDtos: DetailedArtistChartApiDto[] = [];
        for (const chartEntry of chartEntries) {
            const track = tracks.find(t => chartEntry.trackId === t.id);
            if (!track) {
                continue;
            }

            const [trackArtists, trackAlbum] = await Promise.all([
                this.catalogueService.getMultipleArtistsById(track.artistIds),
                this.catalogueService.getAlbumById(track.albumId),
            ]);

            chartEntryDtos.push(this.apiHelper.convertArtistTrackChartItem(chartEntry, track, trackArtists, trackAlbum !== null ? trackAlbum : undefined));
        }

        return {
            id: artist.id,
            name: artist.name,
            images: this.apiHelper.convertImageApiDtos(artist.images),
            externalUrls,
            playedInfo: { 
                firstPlayedAt: playedInfo.firstPlayedAt,
                lastPlayedAt: playedInfo.lastPlayedAt,
                timesPlayed: playedInfo.timesPlayed,
            },
            charts: chartEntryDtos,
        }
    }

}