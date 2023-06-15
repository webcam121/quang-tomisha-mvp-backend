import { Global, Module } from '@nestjs/common';
import { JobLogService } from './job-log.service';
import { JobLogController } from './job-log.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobLog } from './job-log.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([JobLog])],
  providers: [JobLogService],
  controllers: [JobLogController],
  exports: [JobLogService],
})
export class JobLogModule {}
