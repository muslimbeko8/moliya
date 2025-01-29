import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersModule } from './users/users.module';
import { SharedModule } from './common/shared/shared.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { CategiesModule } from './categories/categories.module';
import { TransactionsModule } from './transactions/transactions.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    SharedModule,
    SequelizeModule.forRoot({
      dialect: 'postgres',
      database: 'postgres',
      username: 'postgres',
      password: '123456',
      host: '127.0.0.1',
      port: 5432,
      autoLoadModels: true,
      synchronize: true,
      // sync: { force: true },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../', 'uploads'),
      serveRoot: '/static',
    }),
    UsersModule,
    CategiesModule,
    TransactionsModule,
    NotificationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
