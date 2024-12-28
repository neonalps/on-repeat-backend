export interface AccountJobApiDto {
    id: number;
    displayName: string;
    intervalSeconds: number;
    failureCount: number;
    enabled: boolean;
    createdAt: Date;
    lastSuccessfulExecution?: Date;
    nextScheduledRun?: Date;
}