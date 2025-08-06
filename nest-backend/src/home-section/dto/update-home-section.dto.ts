import { PartialType } from '@nestjs/swagger';
import { CreateHomeSectionDto } from './create-home-section.dto';

export class UpdateHomeSectionDto extends PartialType(CreateHomeSectionDto) {}
