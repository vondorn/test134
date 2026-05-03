import {
  Controller,
  Post,
  Body,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { AppService } from './app.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('orders')
@Controller('orders')
export class AppController {
  private readonly logger: Logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Post()
  @ApiOperation({ summary: 'Создание нового заказа' })
  @ApiResponse({
    status: 201,
    description: 'Заказ успешно отправлен в очередь',
  })
  @ApiResponse({ status: 500, description: 'Ошибка сервера очередей' })
  async createOrder(@Body() body: CreateOrderDto) {
    this.logger.log('Получен запрос на создание заказа');

    try {
      await this.appService.createOrder(body);
      return { status: 'Заказ успешно отправлен в очередь' };
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Сбой при постановке в очередь: ${error.message}`,
          error.stack,
        );
      }
      throw new InternalServerErrorException('Сбой при постановке в очередь');
    }
  }
}
