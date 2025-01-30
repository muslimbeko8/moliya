import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Notifications } from './notifications.model';
import { Cron } from '@nestjs/schedule';
import { TransactionsService } from 'src/transactions/transactions.service';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notifications)
    private readonly notificationModel: typeof Notifications,
    private readonly transactionsService: TransactionsService,
  ) { }

  create(createNotificationDto: CreateNotificationDto) {
    return this.notificationModel.create(createNotificationDto);
  }

  findAll(userId: number) {
    return this.notificationModel.findAll({ where: { user_id: userId } });
  }

  findOne(id: number) {
    return this.notificationModel.findByPk(id);
  }

  async update(id: number, updateNotificationDto: UpdateNotificationDto) {
    // Add validation to ensure id is a valid number
    if (!id || isNaN(id)) {
      throw new Error('Invalid notification ID');
    }

    const [affectedRows] = await this.notificationModel.update(updateNotificationDto, {
      where: { id },
    });
    // console.log(affectedRows)
    // console.log("this.notificationModel.findByPk(id);", this.notificationModel.findByPk(id))
    if (affectedRows > 0) {
      return await this.notificationModel.findByPk(id);
    }
    return 'Notification not found';
  }

  remove(id: number) {
    return this.notificationModel.destroy({ where: { id } });
  }

  @Cron('0 0 * * *') // Every day at midnight
  async sendDailyNotifications() {
    const allUsers = await this.getAllUserIds();

    for (const user of allUsers) {
      const { id: userId } = user;
      const { income, expenses } = await this.transactionsService.getDailySummary(userId);

      const message = `Daily summary: Income: ${income}, Expenses: ${expenses}`;
      await this.create({ user_id: userId, message, is_read: false });
    }
  }

  @Cron('0 0 1 * *') // First day of each month
  async sendMonthlyNotifications() {
    const allUsers = await this.getAllUserIds();

    for (const user of allUsers) {
      const { id: userId } = user;
      const { income, expenses } = await this.transactionsService.getMonthlySummary(userId);

      const message = `Monthly summary: Income: ${income}, Expenses: ${expenses}`;
      await this.create({ user_id: userId, message, is_read: false });
    }
  }

  async triggerTestNotification(userId: number) {
    const timestamp = new Date().toISOString();
    const { income, expenses } = await this.transactionsService.getDailySummary(userId);

    return await this.create({
      user_id: userId,
      message: `Manually triggered test notification at ${timestamp}\nCurrent stats - Income: ${income}, Expenses: ${expenses}`,
      is_read: false,
      // notification_type: 'manual_test'
    });
  }

  // Mock method to fetch user IDs (replace with actual implementation):
  private async getAllUserIds() {
    return [{ id: 1 }, { id: 2 }]; // Replace this with actual logic to fetch user IDs
  }
}