import { Module, BadRequestException } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as multer from 'multer';
import { AssetService } from './asset.service';
import { AssetController } from './asset.controller';

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        storage: multer.diskStorage({
          destination: configService.get('tmpDir'),
          filename(req: any, file: any, cb: any): void {
            cb(undefined, [Math.random().toString(36).substr(2), (file.originalname.split('.').slice(-1)[0] || '')].join('.'));
          },
        }),
        fileFilter(req: any, file: any, cb: any): void {
          if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(undefined, true);
          } else {
            cb(new BadRequestException('File type not supported'));
          }
        },
        limits: {
          fileSize: 1024 * 1024 * 20,
        },
      })
    })
  ],
  controllers: [AssetController],
  providers: [AssetService],
})
export class AssetModule {}
