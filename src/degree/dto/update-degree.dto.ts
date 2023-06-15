import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateDegreeDto } from './create-degree.dto';

export class UpdateDegreeDto extends PartialType(
  OmitType(CreateDegreeDto, ['type', 'userId']),
) {}
