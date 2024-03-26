import { AlbumApiDto } from "@src/models/api/album";
import { ArtistApiDto } from "@src/models/api/artist";
import { TrackApiDto } from "@src/models/api/track";
import { AccountChartApiDto } from "@src/models/api/account-chart";

export interface SearchResultItemApiDto {
    type: string;
    item: TrackApiDto | AlbumApiDto | ArtistApiDto | AccountChartApiDto;
}