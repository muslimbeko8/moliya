import {
  Table,
  Model,
  Column,
  DataType,
  AllowNull,
} from 'sequelize-typescript';

@Table({ tableName: 'categories' })
export class Categories extends Model<Categories> {
  @AllowNull(false)
  @Column({
    type: DataType.STRING,
  })
  name: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
  })
  type: string;
}
