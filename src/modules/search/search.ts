import { requireNonNull } from "@src/util/common";
import { CatalogueService } from "@src/modules/catalogue/service";
import { SimpleTrackDetailsDao } from "@src/models/classes/dao/simple-track-details";
import { SearchResultItemApiDto } from "@src/models/api/search-result-item";
import { ApiHelper } from "@src/api/helper";
import { ArtistDao } from "@src/models/classes/dao/artist";
import { ArtistApiDto } from "@src/models/api/artist";
import { ChartService } from "@src/modules/chart/service";
import { AccountChartDao } from "@src/models/classes/dao/account-chart";
import { AccountChartApiDto } from "@src/models/api/account-chart";

export enum SearchPickOptions {
    ALBUMS = 'ALBUMS',
    ARTISTS = 'ARTISTS',
    TRACKS = 'TRACKS',
    CHARTS = 'CHARTS',
};

export class SearchService {

    private readonly apiHelper: ApiHelper;
    private readonly catalogueService: CatalogueService;
    private readonly chartService: ChartService;

    constructor(apiHelper: ApiHelper, catalogueService: CatalogueService, chartService: ChartService) {
        this.apiHelper = requireNonNull(apiHelper);
        this.catalogueService = requireNonNull(catalogueService);
        this.chartService = requireNonNull(chartService);
    }

    public async fullText(input: string, pick: SearchPickOptions[]): Promise<SearchResultItemApiDto[]> {
        const [tracks, artists, charts] = await Promise.all([
            this.catalogueService.searchTracksFullText(input),
            this.catalogueService.searchArtistsFullText(input),
            this.chartService.fullTextSearch(input),
        ]);

        return [
            ...tracks.map(track => this.convertTrackItem(track)),
            ...artists.map(artist => this.convertArtistItem(artist)),
            ...charts.map(chart => this.convertChartItem(chart)),
        ];
    }

    private convertTrackItem(item: SimpleTrackDetailsDao): SearchResultItemApiDto {
        return {
            type: 'track',
            item: this.apiHelper.convertToTrackApiDtoFromSimpleTrackDetails(item),
        };
    }

    private convertArtistItem(item: ArtistDao): SearchResultItemApiDto {
        return {
            type: 'artist',
            item: this.apiHelper.convertArtistApiDto(item) as ArtistApiDto,
        };
    }

    private convertChartItem(item: AccountChartDao): SearchResultItemApiDto {
        return {
            type: 'chart',
            item: this.apiHelper.convertAccountChartApiDto(item) as AccountChartApiDto,
        }
    }
}