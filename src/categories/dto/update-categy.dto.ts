import { PartialType } from '@nestjs/swagger';
import { CreateCategyDto } from './create-categy.dto';

export class UpdateCategyDto extends PartialType(CreateCategyDto) {}
