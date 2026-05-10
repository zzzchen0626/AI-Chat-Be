import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Chat } from './chat/entities/chat.entity';
import { Message } from './chat/entities/message.entity';
import { FileEntity } from './file/entities/file.entity';
import { User } from './users/entities/user.entity';

config({ path: 'src/.env' });

const entities = [User, Chat, Message, FileEntity];

const isProductionPostgres = Boolean(process.env.DATABASE_URL);

const dataSourceOptions: DataSourceOptions = isProductionPostgres
  ? {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      synchronize: false,
      entities,
      migrations: ['src/migrations/*.ts'],
    }
  : {
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT ?? 3306),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      charset: 'utf8mb4',
      synchronize: false,
      entities,
      migrations: ['src/migrations/*.ts'],
    };

export default new DataSource(dataSourceOptions);
