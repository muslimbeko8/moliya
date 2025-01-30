import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'notifications',
})
export class Notifications extends Model<Notifications> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  user_id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  message: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_read: boolean;
}