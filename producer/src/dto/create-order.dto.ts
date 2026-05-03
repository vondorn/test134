import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Текст сообщения для отправки в Telegram',
    example: 'Новый заказ',
  })
  message: string;
}
