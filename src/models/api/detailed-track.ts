import { PlayedInfoApiDto } from "@src/models/api/played-info";
import { ArtistApiDto } from "@src/models/api/artist";
import { AlbumApiDto } from "@src/models/api/album";
import { PaginatedResponseDto } from "@src/models/api/paginated-response";
import { PlayedHistoryApiDto } from "@src/models/api/played-history";

export interface DetailedTrackApiDto {
    id: number;
    name: string;
    artists: ArtistApiDto[];
    album: AlbumApiDto | null;
    playedInfo: PlayedInfoApiDto;
    externalUrls: Record<string, string>;
    explicit: boolean | null;
    isrc: string | null;
    discNumber: number | null;
    trackNumber: number | null;
    durationMs: number | null;
    history?: PaginatedResponseDto<PlayedHistoryApiDto>;
}