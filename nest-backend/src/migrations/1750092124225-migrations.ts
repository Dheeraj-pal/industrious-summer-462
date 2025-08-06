import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1750092124225 implements MigrationInterface {
    name = 'Migrations1750092124225'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "imageUrl"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "imageUrl" character varying`);
    }

}
