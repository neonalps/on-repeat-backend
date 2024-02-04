/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

const TABLE_NAME = "track_chart_details";

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable(TABLE_NAME, {
        id: 'id',
        chart_id: {
            type: 'integer',
            notNull: true,
            references: `"chart"`,
        },
        track_id: {
            type: 'integer',
            notNull: true,
            references: `"track"`,
        },
        place: {
            type: 'integer',
            notNull: true,
        },
        play_count: {
            type: 'integer',
            notNull: false,
        },
    });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable(TABLE_NAME);
}
