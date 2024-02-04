export interface AccountChartDaoInterface {
    id: number;
    accountId: number;
    name: string;
    type: string;
    from: Date;
    to: Date;
    thumbnailUrl: string;
    createdAt: Date;
}