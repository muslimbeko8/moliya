import {
  Table,
  Model,
  Column,
  DataType,
  AllowNull,
} from 'sequelize-typescript';

@Table({ tableName: 'users' })
export class Users extends Model<Users> {
  @AllowNull(false)
  @Column({
    type: DataType.STRING,
  })
  full_name: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
  })
  phone: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
  })
  email: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
  })
  password: string;

  @Column({
    type: DataType.ENUM('admin', 'user'),
    defaultValue: 'user',
  })
  role: 'admin' | 'user';

  @Column({
    type: DataType.STRING,
  })
  photo: string;
}
