import { Module } from '@nestjs/common';
import { SupportService } from './support.service';
import { SupportController } from './support.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Support } from './support.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Support])],
  providers: [SupportService],
  controllers: [SupportController]
})
export class SupportModule {}
