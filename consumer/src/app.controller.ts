import { Controller } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { TelegramService } from './telegram/telegram.service';

@Controller()
export class AppController {

  constructor(private telegramService: TelegramService) {}
    
  @EventPattern('order_created')
  async handleOrderCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('Message:', data);

    this.telegramService.sendMessage(data.status);
    this.ack(context);
    
  }

  private ack(context: RmqContext) {
    context.getChannelRef().ack(context.getMessage());
  }
}
