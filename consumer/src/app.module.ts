import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TelegramService } from './telegram/telegram.service';
import { TelegramModule } from './telegram/telegram.module';
import { RedisModule, RedisService } from '@songkeys/nestjs-redis';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    TelegramModule,
    RedisModule.forRoot({
      config: {
        host: 'localhost',
        port: 6379,
      },
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}