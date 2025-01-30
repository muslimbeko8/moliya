import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsService } from './transactions.service';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { Request } from 'express-serve-static-core';


@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  async create(@Req() req: Request, @Body() createTransactionDto: CreateTransactionDto) {
    const userId = req.user.id; // Assuming `req.user` is populated by the AuthGuard
    return this.transactionsService.create(userId, createTransactionDto);
  }

  @Get()
  async findAll(@Req() req: Request) {
    const userId = req.user.id;
    return this.transactionsService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: number) {
    const userId = req.user.id;
    return this.transactionsService.findOne(userId, id);
  }

  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: number,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    const userId = req.user.id;
    return this.transactionsService.update(userId, id, updateTransactionDto);
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: number) {
    const userId = req.user.id;
    return this.transactionsService.remove(userId, id);
  }

  @Get('daily-summary')
  getDailySummary(@Query('userId') userId: number) {
    return this.transactionsService.getDailySummary(userId);
  }

  @Get('monthly-summary')
  getMonthlySummary(@Query('userId') userId: number) {
    return this.transactionsService.getMonthlySummary(userId);
  }
}
