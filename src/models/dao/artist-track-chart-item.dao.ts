export interface ArtistTrackChartItemDaoInterface {
    chartId: number;
    chartName: string;
    trackId: number;
    place: number;
    playCount: number | null;
}