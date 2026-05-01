import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';

@Injectable()
export class TelegramService{
    private bot: Telegraf;
    private chatId: number;

    constructor(private configService: ConfigService) {
        const token = this.configService.get<string>('TG_BOT_TOKEN');
        if (!token) {
            throw new Error('токен не задан в .env файле');
        }
        const id = this.configService.get<number>('TG_CHAT_ID');
        if (!id) {
            throw new Error('ID чата не задан в .env файле');
        }
        this.bot = new Telegraf(token);
        this.chatId = id;
    }

    async sendMessage(message: string): Promise<void> {
        try {
            await this.bot.telegram.sendMessage(this.chatId, message, {
                parse_mode: 'HTML',
            });
            console.log('сообщение отправлено');
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}
