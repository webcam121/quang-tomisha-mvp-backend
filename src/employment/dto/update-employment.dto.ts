import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateEmploymentDto } from './create-employment.dto';

export class UpdateEmploymentDto extends PartialType(
  OmitType(CreateEmploymentDto, ['branchId', 'notificationId']),
) {}
