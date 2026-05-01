import { Controller } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { TelegramService } from './telegram/telegram.service';
import Redis from 'ioredis';
import { RedisService } from '@songkeys/nestjs-redis';

@Controller()
export class AppController {
  private redis: Redis;

  constructor(private telegramService: TelegramService, private redisService: RedisService) {
    this.redis = this.redisService.getClient();
  }

  @EventPattern('order_created')
  async handleOrderCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('Message:', data);

    const orderId = data.id;
    const redisKey = `processed_order:${orderId}`;

    const lock = await this.redis.set(redisKey, 'processed', 'EX', 86400, 'NX');

    if (!lock) {
      console.log(`Заказ ${orderId} уже обрабатывался`);
      return this.ack(context);
    }

    try {
      await this.telegramService.sendMessage(data.message);
      this.ack(context);
    } catch (error) {
      await this.redis.del(redisKey);
      console.log(error);
    }
  }

  private ack(context: RmqContext) {
    context.getChannelRef().ack(context.getMessage());
  }
}
