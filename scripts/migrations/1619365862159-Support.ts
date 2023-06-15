import {MigrationInterface, QueryRunner} from "typeorm";

export class Support1619365862159 implements MigrationInterface {
    name = 'Support1619365862159'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "supports" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "message" character varying(500), "name" character varying(250), "email" character varying(150) NOT NULL, "address" character varying(1000), "website" character varying(500), "status" smallint NOT NULL DEFAULT 1, "createdById" uuid, CONSTRAINT "PK_d8c2a7cbebc6494f00dda770105" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD "isAdmin" boolean`);
        await queryRunner.query(`ALTER TABLE "reports" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "reports" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "reports" ADD "status" smallint NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE "reports" ADD "createdById" uuid`);
        await queryRunner.query(`ALTER TABLE "reports" ADD CONSTRAINT "FK_fddee96a7e01bddcc3e5eb610bf" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "supports" ADD CONSTRAINT "FK_ce5172eb5b56a8906fd5e60fae6" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "supports" DROP CONSTRAINT "FK_ce5172eb5b56a8906fd5e60fae6"`);
        await queryRunner.query(`ALTER TABLE "reports" DROP CONSTRAINT "FK_fddee96a7e01bddcc3e5eb610bf"`);
        await queryRunner.query(`ALTER TABLE "reports" DROP COLUMN "createdById"`);
        await queryRunner.query(`ALTER TABLE "reports" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "reports" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "reports" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isAdmin"`);
        await queryRunner.query(`DROP TABLE "supports"`);
    }

}
