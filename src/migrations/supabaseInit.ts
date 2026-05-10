import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSupabaseSchema1710000000000 implements MigrationInterface {
  name = 'InitSupabaseSchema1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL NOT NULL,
        "userName" character varying(256) NOT NULL,
        "password" character varying(256) NOT NULL,
        "nickName" character varying(256) NOT NULL,
        "createTime" TIMESTAMP NOT NULL DEFAULT now(),
        "updateTime" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "chat" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(256) DEFAULT '新对话',
        "isActive" boolean NOT NULL DEFAULT true,
        "userId" integer NOT NULL,
        "createTime" TIMESTAMP NOT NULL DEFAULT now(),
        "updateTime" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_chat_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."message_role_enum" AS ENUM('user', 'system', 'assistant');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "message" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "role" "public"."message_role_enum" NOT NULL DEFAULT 'user',
        "content" text NOT NULL,
        "imgUrl" json,
        "fileContent" json,
        "chatId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_message_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "file_entity" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "fileId" character varying(256) NOT NULL,
        "filePath" character varying,
        "totalChunks" integer NOT NULL DEFAULT 0,
        "isCompleted" boolean NOT NULL DEFAULT false,
        "isCanceled" boolean NOT NULL DEFAULT false,
        "chatId" uuid,
        "uploadedChunks" integer NOT NULL DEFAULT 0,
        "createTime" TIMESTAMP NOT NULL DEFAULT now(),
        "updateTime" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_file_entity_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_chat_userId" ON "chat" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_message_chatId" ON "message" ("chatId")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_file_entity_chatId" ON "file_entity" ("chatId")
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "chat"
        ADD CONSTRAINT "FK_chat_userId"
        FOREIGN KEY ("userId") REFERENCES "users"("id")
        ON DELETE NO ACTION ON UPDATE NO ACTION;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "message"
        ADD CONSTRAINT "FK_message_chatId"
        FOREIGN KEY ("chatId") REFERENCES "chat"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "file_entity"
        ADD CONSTRAINT "FK_file_entity_chatId"
        FOREIGN KEY ("chatId") REFERENCES "chat"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "file_entity" DROP CONSTRAINT IF EXISTS "FK_file_entity_chatId"`);
    await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT IF EXISTS "FK_message_chatId"`);
    await queryRunner.query(`ALTER TABLE "chat" DROP CONSTRAINT IF EXISTS "FK_chat_userId"`);

    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_file_entity_chatId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_message_chatId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_chat_userId"`);

    await queryRunner.query(`DROP TABLE IF EXISTS "file_entity"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "message"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."message_role_enum"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "chat"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
