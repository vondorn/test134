import { Controller } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';

@Controller()
export class AppController {
    
  @EventPattern('order_created')
  async handleOrderCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('Message:', data);

    this.ack(context);
    
  }

  private ack(context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    channel.ack(originalMsg); 
  }
}
