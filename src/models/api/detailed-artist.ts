import { PlayedInfoApiDto } from "@src/models/api/played-info";
import { ImageApiDto } from "@src/models/api/image";
import { TrackApiDto } from "@src/models/api/track";

export interface DetailedArtistApiDto {
    id: number;
    name: string;
    playedInfo: PlayedInfoApiDto;
    externalUrls: Record<string, string>;
    images: ImageApiDto[];
    charts?: DetailedArtistChartApiDto[];
}

export interface DetailedArtistChartApiDto {
    chart: {
        id: number;
        name: string;
    },
    place: number;
    playCount: number | null;
    track: TrackApiDto;
}