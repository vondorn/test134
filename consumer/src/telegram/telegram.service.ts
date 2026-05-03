import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: Telegraf;
  private chatId: number;

  constructor(
    private configService: ConfigService,
    private readonly logger: Logger = new Logger(TelegramService.name),
  ) {
    const token = this.configService.get<string>('TG_BOT_TOKEN');
    const id = this.configService.get<number>('TG_CHAT_ID');

    if (!token || !id) {
      this.logger.error(
        'Ошибка инициализации: TG_BOT_TOKEN или TG_CHAT_ID не найдены в .env',
      );
      throw new Error('Ошибка конфигурации Telegram');
    }

    this.bot = new Telegraf(token);
    this.chatId = id;
  }

  async onModuleInit() {
    this.logger.log('Сервис Telegram инициализирован');
  }

  async sendMessage(message: string): Promise<void> {
    try {
      await this.bot.telegram.sendMessage(this.chatId, message, {
        parse_mode: 'HTML',
      });
      this.logger.log('Сообщение успешно отправлено в Telegram');
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Ошибка при отправке сообщения в Telegram: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(`Неизвестная ошибка Telegram: ${String(error)}`);
      }
      throw error;
    }
  }
}
