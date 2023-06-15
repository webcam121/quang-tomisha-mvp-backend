import * as fs from 'fs'
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';

const MAX_FILE_AGE = 6 * 60 * 60 * 1000;

@Injectable()
export class AssetCron {
  constructor(private configService: ConfigService) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  public removeExpiredTempAssets(): void {
    const tmpDir = this.configService.get('tmpDir')

    fs.readdir(tmpDir, (err, paths): void => {
      if (err || !paths) {
        return;
      }

      paths.forEach((path): void => {
        fs.stat(tmpDir + path, (err, stat) => {
          if (!stat || !(stat.birthtime instanceof Date)) {
            return;
          }

          const age = Date.now() - stat.birthtime.valueOf();
          if (age > MAX_FILE_AGE) {
            fs.unlink(tmpDir + path, function (): void {});
          }
        });
      });
    });
  }
}
