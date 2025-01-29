import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Transactions } from './transactions.model';

@Module({
  imports: [SequelizeModule.forFeature([Transactions])],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
