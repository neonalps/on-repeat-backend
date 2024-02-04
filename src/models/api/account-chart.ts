export interface AccountChartApiDto {
    id: number;
    name: string;
    type: string;
    from: Date;
    to: Date;
    thumbnailUrl: string | null;
    createdAt: Date;
}