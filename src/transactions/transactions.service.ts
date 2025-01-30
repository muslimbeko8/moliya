import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transactions } from './transactions.model';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Op } from 'sequelize';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transactions) private readonly transactionModel: typeof Transactions,
  ) {}

  async create(userId: number, createTransactionDto: CreateTransactionDto): Promise<Transactions> {
    try {
      const transaction = await this.transactionModel.create({
        user_id: userId,
        ...createTransactionDto,
      });
      return transaction;
    } catch (error) {
      throw new UnauthorizedException('Failed to create transaction');
    }
  }

  async findAll(userId: number): Promise<Transactions[]> {
    return this.transactionModel.findAll({
      where: { user_id: userId },
    });
  }

  async findOne(userId: number, id: number): Promise<Transactions> {
    const transaction = await this.transactionModel.findOne({
      where: { user_id: userId, id },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found.`);
    }

    return transaction;
  }

  async update(userId: number, id: number, updateTransactionDto: UpdateTransactionDto): Promise<Transactions> {
    const transaction = await this.findOne(userId, id);
    return transaction.update(updateTransactionDto);
  }

  async remove(userId: number, id: number): Promise<{ message: string }> {
    const transaction = await this.findOne(userId, id);
    await transaction.destroy();
    return { message: 'Transaction deleted successfully' };
  }

  async getDailySummary(userId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
  
    const transactions = await this.transactionModel.findAll({
      where: {
        user_id: userId,
        createdAt: { [Op.gte]: today, [Op.lt]: tomorrow },
      },
    });
  
    const income = transactions
      .filter((t) => t.transaction_type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  
    const expenses = transactions
      .filter((t) => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  
    return { userId, income, expenses }; // Return as an object
  }
  
  async getMonthlySummary(userId: number) {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  
    const transactions = await this.transactionModel.findAll({
      where: {
        user_id: userId,
        createdAt: { [Op.gte]: firstDayOfMonth, [Op.lt]: firstDayOfNextMonth },
      },
    });
  
    const income = transactions
      .filter((t) => t.transaction_type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  
    const expenses = transactions
      .filter((t) => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  
    return { userId, income, expenses }; // Return as an object
  }
  
}
