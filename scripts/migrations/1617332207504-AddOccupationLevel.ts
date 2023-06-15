import {MigrationInterface, QueryRunner} from "typeorm";

export class AddOccupationLevel1617332207504 implements MigrationInterface {
    name = 'AddOccupationLevel1617332207504'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "occupations" ADD "level" smallint DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "occupations" DROP COLUMN "level"`);
    }

}
