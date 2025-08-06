import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGenderAndDealAndSponsoredToProduct1753548825763 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE gender_enum AS ENUM ('male', 'female', 'kids');
            ALTER TABLE "products" ADD "gender" gender_enum;
            ALTER TABLE "products" ADD "isDealOfTheWeek" boolean NOT NULL DEFAULT false;
            ALTER TABLE "products" ADD "isSponsored" boolean NOT NULL DEFAULT false;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "products" DROP COLUMN "isSponsored";
            ALTER TABLE "products" DROP COLUMN "isDealOfTheWeek";
            ALTER TABLE "products" DROP COLUMN "gender";
            DROP TYPE gender_enum;
        `);
    }

}
