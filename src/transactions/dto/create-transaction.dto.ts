import { IsDate, IsEnum, IsNumber, IsString } from 'class-validator';

export class CreateTransactionDto {
  @IsNumber()
  user_id: number;

  @IsEnum(['income', 'expense'])
  type: 'income' | 'expense';

  @IsString()
  categoryName: string;

  @IsNumber()
  amount: number;

  @IsDate()
  data: Date;
}
