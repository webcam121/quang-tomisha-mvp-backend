import { Global, Module } from '@nestjs/common';
import { EmploymentService } from './employment.service';
import { EmploymentController } from './employment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employment } from './employment.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Employment])],
  providers: [EmploymentService],
  controllers: [EmploymentController],
  exports: [EmploymentService],
})
export class EmploymentModule {}
