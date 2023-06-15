import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { Report } from '../report.entity';

export class FindReportsDto extends PaginationDto<Report> {}
