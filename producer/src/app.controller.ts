// src/app.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  async createOrder(@Body() body: CreateOrderDto) {
    await this.appService.createOrder(body);
    return { status: 'Отправлено' };
  }
}