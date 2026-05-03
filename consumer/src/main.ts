import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const appContext = await NestFactory.createApplicationContext(AppModule);

  const configService = appContext.get(ConfigService);

  const rmqUrl = configService.get<string>('RMQ_URL')!;
  const rmqQueue = configService.get<string>('RMQ_QUEUE')!;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [rmqUrl],
        queue: rmqQueue,
        noAck: false,
        queueOptions: {
          durable: true,
        },
      },
    },
  );

  await app.listen();
  logger.log('Сервис Consumer запущен.');
}
bootstrap();
