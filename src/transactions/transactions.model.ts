import {
  Table,
  Model,
  Column,
  DataType,
  AllowNull,
} from 'sequelize-typescript';

@Table({ tableName: 'transactions' })
export class Transactions extends Model<Transactions> {
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
  })
  user_id: number;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM('income', 'expense'),
  })
  type: 'income' | 'expense';

  @AllowNull(false) 
  @Column({
    type: DataType.STRING,
  })
  categoryName: string;

  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
  })
  amount: number;

  @AllowNull(false)
  @Column({
    type: DataType.DATE,
  })
  data: Date;
}
