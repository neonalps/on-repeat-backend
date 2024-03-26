import { StoreChartItemRequestDto } from "@src/models/api/store-chart-item-request";

export interface PutAccountChartRequestDto {
    accountChartId: number;
    name: string;
    type: string;
    from: Date;
    to: Date;
    items: StoreChartItemRequestDto[];
}