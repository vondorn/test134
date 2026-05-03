import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { TelegramService } from './telegram/telegram.service';
import { RedisService } from '@songkeys/nestjs-redis';
import { RmqContext } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

describe('AppController', () => {
  let controller: AppController;
  let telegramService: TelegramService;

  const mockRedis = {
    set: jest.fn(),
    del: jest.fn(),
  };

  const mockRmqContext = {
    getMessage: jest.fn().mockReturnValue('тест'),
    getChannelRef: jest.fn().mockReturnValue({
      ack: jest.fn(),
    }),
  } as unknown as RmqContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: TelegramService,
          useValue: { sendMessage: jest.fn() },
        },
        {
          provide: RedisService,
          useValue: { getClient: () => mockRedis },
        },
        {
          provide: Logger,
          useValue: { log: jest.fn(), error: jest.fn(), warn: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
    telegramService = module.get<TelegramService>(TelegramService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleOrderCreated', () => {
    const payload = { id: '123abc', message: 'тест' };

    it('should log error and ack if no id provided', async () => {
      await controller.handleOrderCreated({}, mockRmqContext);

      expect(mockRmqContext.getChannelRef().ack).toHaveBeenCalled();
    });

    it('success', async () => {
      mockRedis.set.mockResolvedValue('OK');

      await controller.handleOrderCreated(payload, mockRmqContext);

      expect(mockRedis.set).toHaveBeenCalledWith(
        `processed_order:${payload.id}`,
        'processed',
        'EX',
        86400,
        'NX',
      );
      expect(telegramService.sendMessage).toHaveBeenCalledWith(payload.message);
      expect(mockRmqContext.getChannelRef().ack).toHaveBeenCalled();
    });

    it('alerady proccessed', async () => {
      mockRedis.set.mockResolvedValue(null);

      await controller.handleOrderCreated(payload, mockRmqContext);

      expect(telegramService.sendMessage).not.toHaveBeenCalled();
      expect(mockRmqContext.getChannelRef().ack).toHaveBeenCalled();
    });

    it('telegram fail', async () => {
      mockRedis.set.mockResolvedValue('OK');
      jest
        .spyOn(telegramService, 'sendMessage')
        .mockRejectedValue(new Error('TG Down'));

      await controller.handleOrderCreated(payload, mockRmqContext);

      // Проверяем, что замок снят, чтобы попробовать снова
      expect(mockRedis.del).toHaveBeenCalledWith(
        `processed_order:${payload.id}`,
      );
      // Проверяем, что ack НЕ был вызван (сообщение вернется в очередь)
      expect(mockRmqContext.getChannelRef().ack).not.toHaveBeenCalled();
    });
  });
});
