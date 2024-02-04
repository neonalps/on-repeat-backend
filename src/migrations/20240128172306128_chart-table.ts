/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

const TABLE_NAME = "chart";

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable(TABLE_NAME, {
        id: 'id',
        account_id: {
            type: 'integer',
            notNull: true,
            references: `"account"`,
        },
        name: {
            type: 'varchar(1000)',
            notNull: true,
        },
        type: {
            type: 'varchar(255)',
            notNull: true,
        },
        from: {
            type: 'timestamptz',
            notNull: true,
        },
        to: {
            type: 'timestamptz',
            notNull: true,
        },
        thumbnail_url: {
            type: 'varchar(1000)',
            notNull: false,
        },
        created_at: {
            type: 'timestamptz',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable(TABLE_NAME);
}
