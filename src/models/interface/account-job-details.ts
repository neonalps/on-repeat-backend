export interface AccountJobDetails {
    id: number;
    displayName: string;
    intervalSeconds: number;
    failureCount: number;
    enabled: boolean;
    createdAt: Date;
    updatedAt?: Date;
    lastSuccessfulExecution?: Date;
    nextScheduleRun?: Date;
}