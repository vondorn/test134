import { Controller, Post, Body, Logger, InternalServerErrorException } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Post()
  async createOrder(@Body() body: CreateOrderDto) {
    this.logger.log('Получен запрос на создание заказа');

    try {
      await this.appService.createOrder(body);
      return { status: 'success' };
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Сбой при постановке в очередь: ${error.message}`, error.stack);
      }
      throw new InternalServerErrorException('Сбой при постановке в очередь');
    }
  }
}