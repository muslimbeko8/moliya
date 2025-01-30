import { IsEnum, IsNotEmpty, IsNumber, IsDateString, IsString } from 'class-validator';

export class CreateTransactionDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsEnum(['expense', 'income'], { message: 'Transaction type must be either expense or income' })
  transaction_type: string;

  @IsNotEmpty()
  @IsDateString()
  date: Date;

  @IsNotEmpty()
  @IsString()
  category_name: string;
}
