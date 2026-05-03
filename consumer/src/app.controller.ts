import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { TelegramService } from './telegram/telegram.service';
import Redis from 'ioredis';
import { RedisService } from '@songkeys/nestjs-redis';

@Controller()
export class AppController {
  private redis: Redis;

  constructor(
    private telegramService: TelegramService,
    private redisService: RedisService,
    private readonly logger: Logger,
  ) {
    this.redis = this.redisService.getClient();
    this.logger = new Logger(AppController.name);
  }

  @EventPattern('order_created')
  async handleOrderCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    if (!data?.id) {
      this.logger.error('Id заказа не определено');
      return this.ack(context);
    }

    this.logger.log(`Принято событие: order_created (id: ${data.id})`);

    const orderId = data.id;
    const redisKey = `processed_order:${orderId}`;

    const lock = await this.redis.set(redisKey, 'processed', 'EX', 86400, 'NX');

    if (!lock) {
      this.logger.warn(`Заказ ${orderId} уже обрабатывался`);
      return this.ack(context);
    }

    try {
      await this.telegramService.sendMessage(data.message);
      this.ack(context);
      this.logger.log(`Заказ ${orderId} успешно обработан`);
    } catch (error) {
      await this.redis.del(redisKey);

      if (error instanceof Error) {
        this.logger.error(
          `Ошибка обработки заказа ${orderId}: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(
          `Неизвестная ошибка при обработке заказа ${orderId}: ${String(error)}`,
        );
      }
    }
  }

  private ack(context: RmqContext) {
    context.getChannelRef().ack(context.getMessage());
  }
}
