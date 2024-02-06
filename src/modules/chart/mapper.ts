import sql from "@src/db/db";
import { AccountChartDao } from "@src/models/classes/dao/account-chart";
import { AccountChartItemDao } from "@src/models/classes/dao/account-chart-item";
import { ArtistTrackChartItemDao } from "@src/models/classes/dao/artist-track-chart-item";
import { TrackChartItemDao } from "@src/models/classes/dao/track-chart-item";
import { AccountChartItemDaoInterface } from "@src/models/dao/account-chart-item.dao";
import { AccountChartDaoInterface } from "@src/models/dao/account-chart.dao";
import { ArtistTrackChartItemDaoInterface } from "@src/models/dao/artist-track-chart-item.dao";
import { TrackChartItemDaoInterface } from "@src/models/dao/track-chart-item.dao";
import { SortOrder } from "@src/modules/pagination/constants";
import { removeNull } from "@src/util/common";

export class ChartMapper {

    public async getAccountChartsPaginated(accountId: number, lastSeenFrom: Date, limit: number, order: SortOrder): Promise<AccountChartDao[]> {
        const sqlSortOrder = this.determineSortOrder(order);

        const result = await sql<AccountChartDaoInterface[]>`
            select
                c.id as id,
                c.name as name,
                c.type as type,
                c.from as from,
                c.to as to,
                c.created_at as created_at
            from
                chart c
            where
                c.account_id = ${ accountId }
                and c.from ${order === SortOrder.ASCENDING ? sql`>` : sql`<`} ${ lastSeenFrom }
            order by
                c.from ${ sqlSortOrder }
            limit ${limit}
        `;
    
        if (!result || result.length === 0) {
            return [];
        }

        return result
            .map(item => AccountChartDao.fromDaoInterface(item))
            .filter(removeNull) as AccountChartDao[];   
    }

    public async getAccountChartById(chartId: number): Promise<AccountChartDao | null> {
        const result = await sql<AccountChartDaoInterface[]>`
            select
                c.id as id,
                c.name as name,
                c.type as type,
                c.from as from,
                c.to as to,
                c.created_at as created_at
            from
                chart c
            where
                c.id = ${ chartId }
        `;
    
        if (!result || result.length === 0) {
            return null;
        }

        const item = result[0];

        return AccountChartDao.fromDaoInterface(item);
    }

    public async getAccountTrackChartDetails(chartId: number): Promise<AccountChartItemDao[]> {
        const result = await sql<AccountChartItemDaoInterface[]>`
            select
                tcd.id as id,
                tcd.chart_id as chart_id,
                tcd.track_id as item_id,
                tcd.place as place,
                tcd.play_count as play_count
            from
                track_chart_details tcd
            where
                tcd.chart_id = ${ chartId }
            order by
                tcd.place ASC
        `;
    
        if (!result || result.length === 0) {
            return [];
        }

        return result
            .map(item => AccountChartItemDao.fromDaoInterface(item))
            .filter(removeNull) as AccountChartItemDao[];   
    }

    public async getEntriesForTrack(trackId: number): Promise<TrackChartItemDao[]> {
        const result = await sql<TrackChartItemDaoInterface[]>`
            select
                c.id as chart_id,
                c.name as chart_name,
                tcd.place as place,
                tcd.play_count as play_count
            from
                chart c left join
                track_chart_details tcd on tcd.chart_id = c.id
            where
                tcd.track_id = ${ trackId }
            order by
                c.from ASC
        `;
    
        if (!result || result.length === 0) {
            return [];
        }

        return result
            .map(item => TrackChartItemDao.fromDaoInterface(item))
            .filter(removeNull) as TrackChartItemDao[];   
    }

    public async getTrackEntriesForArtist(artistId: number): Promise<ArtistTrackChartItemDao[]> {
        const result = await sql<ArtistTrackChartItemDaoInterface[]>`
            select
                c.id as chart_id,
                c.name as chart_name,
                tcd.track_id as track_id,
                tcd.place as place,
                tcd.play_count as play_count
            from
                chart c left join
                track_chart_details tcd on tcd.chart_id = c.id left join
                track_artists ta on tcd.track_id = ta.track_id
            where
                ta.artist_id = ${ artistId }
            order by
                c.from ASC
        `;
    
        if (!result || result.length === 0) {
            return [];
        }

        return result
            .map(item => ArtistTrackChartItemDao.fromDaoInterface(item))
            .filter(removeNull) as ArtistTrackChartItemDao[];   
    }

    private determineSortOrder(order: SortOrder) {
        return order === SortOrder.DESCENDING ? sql`desc` : sql`asc`;
    }

}