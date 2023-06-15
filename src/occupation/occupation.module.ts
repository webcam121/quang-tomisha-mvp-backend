import { Global, Module } from '@nestjs/common';
import { OccupationService } from './occupation.service';
import { OccupationController } from './occupation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Occupation } from './occupation.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Occupation])],
  providers: [OccupationService],
  controllers: [OccupationController],
  exports: [OccupationService],
})
export class OccupationModule {}
