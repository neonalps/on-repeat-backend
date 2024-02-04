export interface AccountChartItemApiDto<T> {
    place: number;
    item: T;
    playCount: number | null;
}