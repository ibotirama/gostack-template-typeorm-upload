import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateCategories1597670452254 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.createTable(new Table({
            name: 'categories',
            columns: [
                { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
                { name: 'title', type: 'varchar', isNullable: false },
                { name: 'created_at', type: 'timestamp with time zone', default: 'now()' },
                { name: 'updated_at', type: 'timestamp with time zone', default: 'now()' },
            ]
        }))
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropTable('categories');
    }

}
