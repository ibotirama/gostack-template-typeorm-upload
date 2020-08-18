import {MigrationInterface, QueryRunner, Table, TableForeignKey} from "typeorm";

export class CreateTransactions1597673505042 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.createTable(new Table({
            name: 'transactions',
            columns: [
                { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
                { name: 'title', type: 'varchar', isNullable: false },
                { name: 'value', type: 'numeric', isNullable: false },
                { name: 'type', type: 'varchar', isNullable: false },
                { name: 'category_id', type: 'uuid', isNullable: true },
                { name: 'created_at', type: 'timestamp with time zone', default: 'now()' },
                { name: 'updated_at', type: 'timestamp with time zone', default: 'now()' },
            ]
        }));

        await queryRunner.createForeignKey( 'transactions', new TableForeignKey({
            name: 'TransactionCategory',
            columnNames: ['category_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'categories',
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        }));

    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropForeignKey('transactions', 'TransactionCategory');
        await queryRunner.dropTable('transactions');
    }

}
