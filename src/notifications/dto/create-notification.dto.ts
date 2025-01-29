export class CreateNotificationDto {}
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class CreateCategyDto {
  @IsNumber()
  user_id: number;

  @IsString()
  message: string;

  @IsBoolean()
  is_reak: boolean;
}
