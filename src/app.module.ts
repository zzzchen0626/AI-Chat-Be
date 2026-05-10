import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { JwtModule } from '@nestjs/jwt';

import { User } from './users/entities/user.entity';
import { EmailModule } from './email/email.module';
import { RedisModule } from './redis/redis.module';
import { LoginGuard } from './login.guard';
import { ChatModule } from './chat/chat.module';
import { Chat } from './chat/entities/chat.entity';
import { Message } from './chat/entities/message.entity';
import { FileModule } from './file/file.module';
import { FileEntity } from './file/entities/file.entity';
import { AiModule } from './agent/ai/ai.module';
import { AgentModule } from './agent/agent.module';
// import { Agent } from './agent/entities/agent.entity';

// import 导入模块;providers,注册服务;controllers,注册控制器;exports,导出模块
// JwtModule 是 @nestjs/jwt 提供的模块，专门用于处理 JWT 的签名、验签等功能。
@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      useFactory: () => ({
        secret: 'fishThing-access',
        signOptions: {
          expiresIn: '15m',
        },
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'src/.env',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const entities = [User, Chat, Message, FileEntity];

        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            ssl: {
              rejectUnauthorized: false,
            },
            synchronize: false,
            entities,
          };
        }

        return {
          type: 'mysql',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE'),
          charset: 'utf8mb4',
          synchronize: false,
          entities, // 添加Agent实体
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
    EmailModule,
    RedisModule,
    ChatModule,
    FileModule,
    AiModule,
    AgentModule,
  ],
  controllers: [AppController],
  // 把 LoginGuard 注册成全局守卫
  providers: [
    AppService,
    {
      useClass: LoginGuard,
      provide: 'APP_GUARD',
    },
  ],
})
export class AppModule {}
