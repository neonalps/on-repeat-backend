export interface AccountChartItemDaoInterface {
    id: number;
    chartId: number;
    itemId: number;
    place: number;
    playCount: number | null;
}