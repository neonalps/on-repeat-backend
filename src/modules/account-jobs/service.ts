import { AccountJobMapper } from "./mapper";
import { validateNotNull } from "@src/util/validation";
import { requireNonNull } from "@src/util/common";
import { CreateAccountJobDto } from "@src/models/classes/dto/create-account-job";
import { AccountJobDao } from "@src/models/classes/dao/account-job";
import { PaginationParams } from "@src/modules/pagination/constants";

export interface GetAccountJobsPaginationParams extends PaginationParams<number> {};

export class AccountJobService {

    private readonly mapper: AccountJobMapper;

    constructor(mapper: AccountJobMapper) {
        this.mapper = requireNonNull(mapper);
    }

    public async create(dto: CreateAccountJobDto): Promise<AccountJobDao | null> {
        validateNotNull(dto, "dto");
        validateNotNull(dto.accountId, "dto.accountId");
        validateNotNull(dto.jobId, "dto.jobId");
        validateNotNull(dto.intervalSeconds, "dto.intervalSeconds");
        validateNotNull(dto.enabled, "dto.enabled");
    
        const accountJobId = await this.mapper.create(dto);
    
        if (!accountJobId) {
            throw new Error("Failed to create account job");
        }
    
        return this.getById(accountJobId);
    }

    public async getByAccountIdPaginated(accountId: number, params: GetAccountJobsPaginationParams): Promise<AccountJobDao[]> {
        validateNotNull(accountId, "accountId");
        validateNotNull(params, "params");
        validateNotNull(params.lastSeen, "params.lastSeen");
        validateNotNull(params.order, "params.order");
        validateNotNull(params.limit, "params.limit");

        return this.mapper.getByAccountId(accountId, params.lastSeen, params.order, params.limit);
    }

    public async checkAccountJobExists(accountId: number, accountJobId: number): Promise<boolean> {
        validateNotNull(accountId, "accountId");
        validateNotNull(accountJobId, "accountJobId");

        return this.mapper.checkAccountJobExists(accountId, accountJobId);
    }

    public async getById(id: number): Promise<AccountJobDao | null> {
        validateNotNull(id, "id");

        return this.mapper.getById(id);
    }

    public async increaseFailureCount(id: number): Promise<void> {
        validateNotNull(id, "id");

        await this.mapper.increaseFailureCount(id);
    }

    public async resetFailureCount(id: number): Promise<void> {
        validateNotNull(id, "id");

        await this.mapper.resetFailureCount(id);
    }

    public async enableAccountJob(accountJobId: number): Promise<void> {
        validateNotNull(accountJobId, "accountJobId");

        await this.mapper.enableAccountJob(accountJobId);
    }

    public async disableAccountJob(id: number): Promise<void> {
        validateNotNull(id, "id");

        await this.mapper.disableAccountJob(id);
    }

}