import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateOrderDto } from './dto/create-order.dto';
import * as uuid from 'uuid'

@Injectable()
export class AppService {
  constructor(@Inject('ORDER_SERVICE') private client: ClientProxy) {}

  async createOrder(dto: CreateOrderDto) {
    const pattern = 'order_created';
    const payload = {
      id: uuid.v4(),
      message: dto.message,
    };

    console.log('Отправка заказа в очередь...', payload);
    
    return this.client.emit(pattern, payload);
  }
}