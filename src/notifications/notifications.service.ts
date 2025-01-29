import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Notifications } from './notifications.model';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notifications)
    private readonly notificationModel: typeof Notifications,
  ) {}
  create(createNotificationDto: CreateNotificationDto) {
    return this.notificationModel.create(createNotificationDto);
  }

  findAll() {
    return this.notificationModel.findAll();
  }

  findOne(id: number) {
    return this.notificationModel.findByPk(id);
  }

  async update(id: number, updateNotificationDto: UpdateNotificationDto) {
    const [affectedRows] = await this.notificationModel.update(
      updateNotificationDto,
      {
        where: { id },
      },
    );
    if (affectedRows > 0) {
      return this.notificationModel.findByPk(id);
    } else {
      return 'Bunday notification mavjud emas';
    }
  }

  remove(id: number) {
    return this.notificationModel.destroy({ where: { id } });
  }
}
