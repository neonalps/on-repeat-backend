export interface CreateChartsForPeriodRequestDto {
    type: string;
    from: number;
    to: number;
    limit: number;
}