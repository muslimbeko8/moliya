import {
  Table,
  Model,
  Column,
  DataType,
  AllowNull,
} from 'sequelize-typescript';

@Table({ tableName: 'notifications' })
export class Notifications extends Model<Notifications> {
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
  })
  user_id: number;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
  })
  message: string;

  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  is_read: boolean;
}
