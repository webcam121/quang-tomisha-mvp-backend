import { Global, Module } from '@nestjs/common';
import { DegreeService } from './degree.service';
import { DegreeController } from './degree.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Degree } from './degree.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Degree])],
  providers: [DegreeService],
  controllers: [DegreeController],
  exports: [DegreeService],
})
export class DegreeModule {}
