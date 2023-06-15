import { Global, Module } from '@nestjs/common';
import { ReferenceService } from './reference.service';
import { ReferenceController } from './reference.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reference } from './reference.entity';
import { ReferenceViewer } from './reference-viewer.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Reference, ReferenceViewer])],
  providers: [ReferenceService],
  controllers: [ReferenceController],
  exports: [ReferenceService],
})
export class ReferenceModule {}
