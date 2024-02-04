import { IllegalStateError } from "@src/api/error/illegal-state-error";
import { ApiHelper } from "@src/api/helper";
import { AccountChartDetailsApiDto } from "@src/models/api/account-chart-details";
import { AccountChartItemApiDto } from "@src/models/api/account-chart-item";
import { GetAccountChartDetailsRequestDto } from "@src/models/api/get-account-chart-details-request";
import { TrackApiDto } from "@src/models/api/track";
import { AccountDao } from "@src/models/classes/dao/account";
import { AccountChartDetailsDao } from "@src/models/classes/dao/account-chart-details";
import { AlbumDao } from "@src/models/classes/dao/album";
import { ArtistDao } from "@src/models/classes/dao/artist";
import { CatalogueService } from "@src/modules/catalogue/service";
import { ChartService } from "@src/modules/chart/service";
import { AuthenticationContext, RouteHandler } from "@src/router/types";
import { isNotDefined, removeNull, requireNonNull } from "@src/util/common";

export class GetAccountChartDetailsHandler implements RouteHandler<GetAccountChartDetailsRequestDto, AccountChartDetailsApiDto<unknown>> {

    static readonly ERROR_CHART_NOT_FOUND = "No chart with this ID exists";

    private readonly apiHelper: ApiHelper;
    private readonly catalogueService: CatalogueService;
    private readonly chartService: ChartService;
    
    constructor(apiHelper: ApiHelper, catalogueService: CatalogueService, chartService: ChartService) {
        this.apiHelper = requireNonNull(apiHelper);
        this.catalogueService = requireNonNull(catalogueService);
        this.chartService = requireNonNull(chartService);
    }

    public async handle(context: AuthenticationContext, dto: GetAccountChartDetailsRequestDto): Promise<AccountChartDetailsApiDto<unknown>> {
        const accountId = (context.account as AccountDao).id;

        // TODO check permission

        const accountChartDetails = await this.chartService.getAccountChartDetails(dto.chartId);
        if (isNotDefined(accountChartDetails)) {
            throw new IllegalStateError(GetAccountChartDetailsHandler.ERROR_CHART_NOT_FOUND);
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