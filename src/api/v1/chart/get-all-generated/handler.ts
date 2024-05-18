import { GeneratedChartApiDto } from "@src/models/api/generated-chart";
import { PaginatedResponseDto } from "@src/models/api/paginated-response";
import { AccountDao } from "@src/models/classes/dao/account";
import { AuthenticationContext, RouteHandler } from "@src/router/types";

export class GetGeneratedChartsHandler implements RouteHandler<void, PaginatedResponseDto<GeneratedChartApiDto>> {
    
    constructor() {
    }

    public async handle(context: AuthenticationContext, _: void): Promise<PaginatedResponseDto<GeneratedChartApiDto>> {
        const accountId = (context.account as AccountDao).id;

        return {
            items: [
                { name: "All-time favourite tracks", year: null, month: null, day: null, type: "track", },
                { name: "All-time favourite artists", year: null, month: null, day: null, type: "artist", },
                { name: "2024 Tracks", year: 2024, month: null, day: null, type: "track", },
                { name: "2024 Artists", year: 2024, month: null, day: null, type: "artist", },
                { name: "2024 April Tracks", year: 2024, month: 4, day: null, type: "track", },
                { name: "2024 April Artists", year: 2024, month: 4, day: null, type: "artist", },
                { name: "2024 March Tracks", year: 2024, month: 3, day: null, type: "track", },
                { name: "2024 March Artists", year: 2024, month: 3, day: null, type: "artist", },
            ],
        }        
    }

}