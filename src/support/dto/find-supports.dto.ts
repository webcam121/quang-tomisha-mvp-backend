import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { Support } from '../support.entity';

export class FindSupportsDto extends PaginationDto<Support> {}
