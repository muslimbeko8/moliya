import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCategyDto {
  @ApiProperty({
    description: 'name',
    example: 'nimadir',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'type',
    example: 'qandaydir',
  })
  @IsString()
  type: string;
}
