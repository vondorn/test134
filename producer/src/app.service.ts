import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateOrderDto } from './dto/create-order.dto';
import * as uuid from 'uuid';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(@Inject('ORDER_SERVICE') private client: ClientProxy) {}

  async createOrder(dto: CreateOrderDto) {
    const payload = {
      id: uuid.v4(),
      message: dto.message,
    };

    this.logger.log(`Отправка заказа в очередь (id: ${payload.id})`);

    return await firstValueFrom(
      this.client.emit('order_created', payload).pipe(timeout(5000)),
    );
  }
}
