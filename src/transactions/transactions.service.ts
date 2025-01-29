import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Transactions } from './transactions.model';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transactions)
    private readonly transactionsModel: typeof Transactions,
  ) {}
  create(createTransactionDto: CreateTransactionDto) {
    return this.transactionsModel.create(createTransactionDto);
  }

  findAll() {
    return this.transactionsModel.findAll();
  }

  findOne(id: number) {
    return this.transactionsModel.findByPk(id);
  }

  async update(id: number, updateTransactionDto: UpdateTransactionDto) {
    const [affectedRows] = await this.transactionsModel.update(
      updateTransactionDto,
      {
        where: { id },
      },
    );
    if (affectedRows > 0) {
      return this.transactionsModel.findByPk(id);
    } else {
      return 'Bunday tranzaksiya mavjud emas';
    }
  }

  remove(id: number) {
    return this.transactionsModel.destroy({ where: { id } });
  }
}
