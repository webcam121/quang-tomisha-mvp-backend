import { Controller, UseGuards, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../auth/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('asset')
export class AssetController {
  constructor(private configService: ConfigService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  public upload (@UploadedFile() file): { src: string } {
    return {
      src: this.configService.get('tmpDirName') + '/' + file.filename,
    }
  }
}
