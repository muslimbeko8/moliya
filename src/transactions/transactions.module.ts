import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Transactions } from './transactions.model';
import { UsersModule } from 'src/users/users.module';
import { AuthGuard } from 'src/common/guard/auth.guard';

@Module({
  imports: [SequelizeModule.forFeature([Transactions]), UsersModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, AuthGuard],
  exports: [TransactionsService]
})
export class TransactionsModule {}
