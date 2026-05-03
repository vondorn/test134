import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Текст сообщения для отправки в Telegram',
    example: 'Новый заказ',
  })
  @IsString({ message: 'Текст должен быть строкой' })
  @IsNotEmpty({ message: 'Текст не должен быть пустым' })
  message: string;
}
