import {MigrationInterface, QueryRunner} from "typeorm";

export class AddReceiptId1621173488932 implements MigrationInterface {
    name = 'AddReceiptId1621173488932';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "receiptId" character varying(500)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "receiptId"`);
    }

}
