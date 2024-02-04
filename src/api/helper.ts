import { ApiConfig } from "@src/api/config";
import { AccountChartApiDto } from "@src/models/api/account-chart";
import { AccountJobScheduleApiDto } from "@src/models/api/account-job-schedule";
import { AccountTokenApiDto } from "@src/models/api/account-token";
import { AlbumApiDto } from "@src/models/api/album";
import { ArtistApiDto } from "@src/models/api/artist";
import { DetailedTrackChartApiDto } from "@src/models/api/detailed-track";
import { ImageApiDto } from "@src/models/api/image";
import { PlayedHistoryApiDto } from "@src/models/api/played-history";
import { PlayedTrackApiDto } from "@src/models/api/played-track";
import { TrackApiDto } from "@src/models/api/track";
import { AccountChartDao } from "@src/models/classes/dao/account-chart";
import { AccountJobScheduleDao } from "@src/models/classes/dao/account-job-schedule";
import { AccountTokenDao } from "@src/models/classes/dao/account-token";
import { AlbumDao } from "@src/models/classes/dao/album";
import { SimpleAlbumDao } from "@src/models/classes/dao/album-simple";
import { ArtistDao } from "@src/models/classes/dao/artist";
import { ImageDao } from "@src/models/classes/dao/image";
import { PlayedTrackDetailsDao } from "@src/models/classes/dao/played-track-details";
import { PlayedTrackHistoryDao } from "@src/models/classes/dao/played-track-history";
import { SimpleTrackDetailsDao } from "@src/models/classes/dao/simple-track-details";
import { TrackDao } from "@src/models/classes/dao/track";
import { TrackChartItemDao } from "@src/models/classes/dao/track-chart-item";
import { isDefined, removeNull, requireNonNull } from "@src/util/common";

interface PublicArtist {
    id: number;
    name: string;
    images: ImageLike[];
}

type AlbumLike = AlbumDao | SimpleAlbumDao;
type ImageLike = ImageDao;

export class ApiHelper {

    private readonly apiConfig: ApiConfig;

    constructor(apiConfig: ApiConfig) {
        this.apiConfig = requireNonNull(apiConfig);
    }

    public getAlbumResourceUrl(albumId: number): string {
        return this.getResourceUrl(this.apiConfig.albumsPath, albumId);
    }

    public getArtistResourceUrl(artistId: number): string {
        return this.getResourceUrl(this.apiConfig.artistsPath, artistId);
    }

    public getTrackResourceUrl(trackId: number): string {
        return this.getResourceUrl(this.apiConfig.tracksPath, trackId);
    }

    public convertTrackApiDto(track: TrackDao, artists: ArtistDao[], album?: AlbumDao): TrackApiDto {
        return {
            id: track.id,
            name: track.name,
            album: this.convertAlbumApiDto(album),
            artists: this.convertArtistApiDtos(artists),
            href: this.getTrackResourceUrl(track.id),
        }
    }

    public convertToTrackApiDtoFromSimpleTrackDetails(item: SimpleTrackDetailsDao): TrackApiDto {
        return {
            id: item.track.id,
            name: item.track.name,
            album: this.convertAlbumApiDto(item.album),
            artists: this.convertArtistApiDtos(item.artists),
            href: this.getTrackResourceUrl(item.track.id),
        }
    }

    public convertAccountTokenApiDto(accountToken: AccountTokenDao): AccountTokenApiDto | null {
        if (!accountToken) {
            return null;
        }

        const scopes = isDefined(accountToken.scope) ? accountToken.scope.split(" ") : [];

        return {
            publicId: accountToken.publicId,
            provider: accountToken.oauthProvider,
            scopes,
            createdAt: accountToken.createdAt,
        }
    }

    public convertAlbumApiDto(album?: AlbumLike | null): AlbumApiDto | null {
        if (!album) {
            return null;
        }

        const albumId = album.id;

        return {
            id: albumId,
            name: album.name,
            href: this.getAlbumResourceUrl(albumId),
            images: this.convertImageApiDtos(Array.from(album.images)),
        };
    }

    public convertArtistApiDto(artist: PublicArtist): ArtistApiDto | null {
        if (!artist) {
            return null;
        }

        const artistId = artist.id;

        return { 
            id: artistId, 
            name: artist.name, 
            href: this.getArtistResourceUrl(artistId),
            images: this.convertImageApiDtos(artist.images),
        };
    }

    public convertArtistApiDtos(artists: PublicArtist[]): ArtistApiDto[] {
        if (!artists || artists.length === 0) {
            return [];
        }

        return artists.map(artist => this.convertArtistApiDto(artist)).filter(removeNull) as ArtistApiDto[];
    }

    public convertImageApiDtos(images: ImageLike[]): ImageApiDto[] {
        return images.map(item => this.convertImageApiDto(item));
    }

    public convertImageApiDto(image: ImageLike): ImageApiDto {
        return {
            height: image.height,
            width: image.width,
            url: image.url,
        }
    }

    public convertAccountJobScheduleApiDto(item: AccountJobScheduleDao): AccountJobScheduleApiDto | null {
        if (!item) {
            return null;
        }

        return {
            publicId: item.publicId,
            state: item.state,
            createdAt: item.createdAt,
            scheduledAfter: item.scheduledAfter,
            scheduledAt: item.scheduledAt || undefined,
            startedAt: item.startedAt || undefined,
            finishedAt: item.finishedAt || undefined,
            errorMessage: item.errorMessage || undefined,
        };
    }

    public convertPlayedHistoryApiDto(dao: PlayedTrackHistoryDao): PlayedHistoryApiDto {
        return {
            playedTrackId: dao.id,
            playedAt: dao.playedAt,
            includeInStatistics: dao.includeInStatistics,
            musicProvider: {
                id: dao.musicProviderId,
                name: dao.musicProviderName,
            },
        };
    }

    public convertPlayedTrackApiDto(item: PlayedTrackDetailsDao): PlayedTrackApiDto {
        let albumApiDto: AlbumApiDto | null = null;

        if (isDefined(item.album)) {
            const album = item.album as SimpleAlbumDao;

            albumApiDto = {
                id: album.id,
                name: album.name,
                href: this.getAlbumResourceUrl(album.id),
                images: this.convertImageApiDtos(Array.from(album.images)),
            }
        }

        return {
            playedTrackId: item.playedTrackId,
            playedAt: item.playedAt,
            includeInStatistics: item.includeInStatistics,
            track: {
                id: item.track.id,
                name: item.track.name,
                href: this.getTrackResourceUrl(item.track.id),
                artists: this.convertArtistApiDtos(Array.from(item.artists)),
                album: albumApiDto,
            },
            musicProvider: {
                id: item.musicProvider.id,
                name: item.musicProvider.name,
            },
        };
    }

    public convertAccountChartApiDto(item: AccountChartDao): AccountChartApiDto {
        return {
            id: item.id,
            name: item.name,
            type: item.type,
            to: item.to,
            from: item.from,
            thumbnailUrl: item.thumbnailUrl,
            createdAt: item.createdAt,
        }
    }

    public convertTrackChartEntries(items: TrackChartItemDao[]): DetailedTrackChartApiDto[] {
        return items.map(item => this.convertTrackChartItem(item));
    };

    public convertTrackChartItem(item: TrackChartItemDao): DetailedTrackChartApiDto {
        return {
            chart: {
                id: item.chartId,
                name: item.chartName,
            },
            place: item.place,
            playCount: item.playCount,
        };
    }

    private getResourceUrl(resourcePath: string, resourceId: string | number): string {
        return [this.apiConfig.baseUrl, resourcePath, resourceId].join('/');
    }

}