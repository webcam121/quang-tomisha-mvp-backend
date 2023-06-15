import {MigrationInterface, QueryRunner} from "typeorm";

export class IndexTables1618836614641 implements MigrationInterface {
    name = 'IndexTables1618836614641'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "hard-skills" DROP COLUMN "jobId"`);
        await queryRunner.query(`ALTER TABLE "soft-skills" DROP COLUMN "jobId"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "emailAdTypes" SET DEFAULT '{1, 2}'::smallint[]`);
        await queryRunner.query(`CREATE INDEX "IDX_3cedae79a651819d3e6ef37809" ON "degrees" ("type") `);
        await queryRunner.query(`CREATE INDEX "IDX_53c5a735a3e7f015c4239908d9" ON "degrees" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_ea660f2baf9c3f3141d7c2ef53" ON "tag" ("title") `);
        await queryRunner.query(`CREATE INDEX "IDX_dbd016fb9b2953fe42f0501197" ON "tag" ("type") `);
        await queryRunner.query(`CREATE INDEX "IDX_a4e25d2549d952b26b0569a0df" ON "hard-skills" ("occupationId") `);
        await queryRunner.query(`CREATE INDEX "IDX_3b1319c72da52696b09a19e455" ON "occupations" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_aaefa0b1489c985e062c205b14" ON "occupations" ("slug") `);
        await queryRunner.query(`CREATE INDEX "IDX_7e7425b17f9e707331e9a6c733" ON "files" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_17ff7c9c8d88c06b50650776c2" ON "soft-skills" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a35729a94e7280cbebaaa541a2" ON "branches" ("companyId") `);
        await queryRunner.query(`CREATE INDEX "IDX_00f1309a74e7cc6d028d3f63e8" ON "jobs" ("title") `);
        await queryRunner.query(`CREATE INDEX "IDX_af4043c296e7da7496402be556" ON "jobs" ("professionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_3d1d36ec60dd45364596778c53" ON "jobs" ("minWorkload") `);
        await queryRunner.query(`CREATE INDEX "IDX_a8a51e37137d37d41eba8559fe" ON "jobs" ("maxWorkload") `);
        await queryRunner.query(`CREATE INDEX "IDX_6a1a9932fbe3fdd22eb283f7b6" ON "jobs" ("level") `);
        await queryRunner.query(`CREATE INDEX "IDX_1dc370219a420d7ae7b4a84473" ON "jobs" ("years") `);
        await queryRunner.query(`CREATE INDEX "IDX_a24e4e0eeb892f8d0ea4727949" ON "jobs" ("genders") `);
        await queryRunner.query(`CREATE INDEX "IDX_c36cb2aad0013cacdbfd503ca4" ON "jobs" ("relationships") `);
        await queryRunner.query(`CREATE INDEX "IDX_7dc8fd9874e2aff21ef778ad5a" ON "interviews" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_86c6a5b65c91b118189dc011aa" ON "interviews" ("jobId") `);
        await queryRunner.query(`CREATE INDEX "IDX_d1db2890fdc184a3952cea4994" ON "interviews" ("companyId") `);
        await queryRunner.query(`CREATE INDEX "IDX_ba82c76bf124871821aedc35b7" ON "interviews" ("applicationId") `);
        await queryRunner.query(`CREATE INDEX "IDX_dc2232dc834728346665f9af27" ON "interviews" ("branchId") `);
        await queryRunner.query(`CREATE INDEX "IDX_32c51c4d8f044eb1547928c2ef" ON "interviews" ("slug") `);
        await queryRunner.query(`CREATE INDEX "IDX_dee629b1248f4ad48268faa9ea" ON "offers" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_4017be0f2811f53a9ac56a9bf1" ON "offers" ("jobId") `);
        await queryRunner.query(`CREATE INDEX "IDX_49aeaf4d165a214b570147e891" ON "offers" ("companyId") `);
        await queryRunner.query(`CREATE INDEX "IDX_6d911e68442dac48e56f96a93a" ON "offers" ("applicationId") `);
        await queryRunner.query(`CREATE INDEX "IDX_f97880a5ff885ab9e9a7cb75c9" ON "offers" ("agencyId") `);
        await queryRunner.query(`CREATE INDEX "IDX_8365a12163af982399a77e9f85" ON "job-logs" ("applicationId") `);
        await queryRunner.query(`CREATE INDEX "IDX_d6f979b3b9166662b3a884f03b" ON "job-logs" ("interviewId") `);
        await queryRunner.query(`CREATE INDEX "IDX_d58058f8bc8e07112a41ec1acb" ON "job-logs" ("offerId") `);
        await queryRunner.query(`CREATE INDEX "IDX_30ef77942fc8c05fcb829dcc61" ON "contacts" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_46936bc11f760c6a05fc20c95e" ON "contacts" ("contactUserId") `);
        await queryRunner.query(`CREATE INDEX "IDX_bda5fb302cdf47f47aceb3c100" ON "contacts" ("status") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_bda5fb302cdf47f47aceb3c100"`);
        await queryRunner.query(`DROP INDEX "IDX_46936bc11f760c6a05fc20c95e"`);
        await queryRunner.query(`DROP INDEX "IDX_30ef77942fc8c05fcb829dcc61"`);
        await queryRunner.query(`DROP INDEX "IDX_d58058f8bc8e07112a41ec1acb"`);
        await queryRunner.query(`DROP INDEX "IDX_d6f979b3b9166662b3a884f03b"`);
        await queryRunner.query(`DROP INDEX "IDX_8365a12163af982399a77e9f85"`);
        await queryRunner.query(`DROP INDEX "IDX_f97880a5ff885ab9e9a7cb75c9"`);
        await queryRunner.query(`DROP INDEX "IDX_6d911e68442dac48e56f96a93a"`);
        await queryRunner.query(`DROP INDEX "IDX_49aeaf4d165a214b570147e891"`);
        await queryRunner.query(`DROP INDEX "IDX_4017be0f2811f53a9ac56a9bf1"`);
        await queryRunner.query(`DROP INDEX "IDX_dee629b1248f4ad48268faa9ea"`);
        await queryRunner.query(`DROP INDEX "IDX_32c51c4d8f044eb1547928c2ef"`);
        await queryRunner.query(`DROP INDEX "IDX_dc2232dc834728346665f9af27"`);
        await queryRunner.query(`DROP INDEX "IDX_ba82c76bf124871821aedc35b7"`);
        await queryRunner.query(`DROP INDEX "IDX_d1db2890fdc184a3952cea4994"`);
        await queryRunner.query(`DROP INDEX "IDX_86c6a5b65c91b118189dc011aa"`);
        await queryRunner.query(`DROP INDEX "IDX_7dc8fd9874e2aff21ef778ad5a"`);
        await queryRunner.query(`DROP INDEX "IDX_c36cb2aad0013cacdbfd503ca4"`);
        await queryRunner.query(`DROP INDEX "IDX_a24e4e0eeb892f8d0ea4727949"`);
        await queryRunner.query(`DROP INDEX "IDX_1dc370219a420d7ae7b4a84473"`);
        await queryRunner.query(`DROP INDEX "IDX_6a1a9932fbe3fdd22eb283f7b6"`);
        await queryRunner.query(`DROP INDEX "IDX_a8a51e37137d37d41eba8559fe"`);
        await queryRunner.query(`DROP INDEX "IDX_3d1d36ec60dd45364596778c53"`);
        await queryRunner.query(`DROP INDEX "IDX_af4043c296e7da7496402be556"`);
        await queryRunner.query(`DROP INDEX "IDX_00f1309a74e7cc6d028d3f63e8"`);
        await queryRunner.query(`DROP INDEX "IDX_a35729a94e7280cbebaaa541a2"`);
        await queryRunner.query(`DROP INDEX "IDX_17ff7c9c8d88c06b50650776c2"`);
        await queryRunner.query(`DROP INDEX "IDX_7e7425b17f9e707331e9a6c733"`);
        await queryRunner.query(`DROP INDEX "IDX_aaefa0b1489c985e062c205b14"`);
        await queryRunner.query(`DROP INDEX "IDX_3b1319c72da52696b09a19e455"`);
        await queryRunner.query(`DROP INDEX "IDX_a4e25d2549d952b26b0569a0df"`);
        await queryRunner.query(`DROP INDEX "IDX_dbd016fb9b2953fe42f0501197"`);
        await queryRunner.query(`DROP INDEX "IDX_ea660f2baf9c3f3141d7c2ef53"`);
        await queryRunner.query(`DROP INDEX "IDX_53c5a735a3e7f015c4239908d9"`);
        await queryRunner.query(`DROP INDEX "IDX_3cedae79a651819d3e6ef37809"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "emailAdTypes" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "soft-skills" ADD "jobId" uuid`);
        await queryRunner.query(`ALTER TABLE "hard-skills" ADD "jobId" uuid`);
    }

}
