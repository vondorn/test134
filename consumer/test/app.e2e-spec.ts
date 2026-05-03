import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../src/app.controller';
import { TelegramService } from '../src/telegram/telegram.service';
import { RedisService } from '@songkeys/nestjs-redis';
import { RmqContext } from '@nestjs/microservices';

describe('Consumer (e2e)', () => {
  let controller: AppController;

  const mockTelegramService = {
    sendMessage: jest.fn(),
  };

  const mockRedis = {
    set: jest.fn(),
    del: jest.fn(),
  };

  const mockRedisService = {
    getClient: jest.fn(() => mockRedis),
  };

  const mockContext = {
    getChannelRef: () => ({
      ack: jest.fn(),
    }),
    getMessage: () => ({}),
  } as unknown as RmqContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: TelegramService,
          useValue: mockTelegramService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('new order', async () => {
    mockRedis.set.mockResolvedValue('OK');
    mockTelegramService.sendMessage.mockResolvedValue(undefined);

    await controller.handleOrderCreated(
      { id: '123abc', message: 'тест' },
      mockContext,
    );

    expect(mockRedis.set).toHaveBeenCalledWith(
      'processed_order:123abc',
      'processed',
      'EX',
      86400,
      'NX',
    );

    expect(mockTelegramService.sendMessage).toHaveBeenCalledWith('тест');
  });

  it('order already processed', async () => {
    mockRedis.set.mockResolvedValue(null);

    await controller.handleOrderCreated(
      { id: '123abc', message: 'тест' },
      mockContext,
    );

    expect(mockTelegramService.sendMessage).not.toHaveBeenCalled();
  });

  it('telegram error', async () => {
    mockRedis.set.mockResolvedValue('OK');
    mockTelegramService.sendMessage.mockRejectedValue(
      new Error('Telegram error'),
    );

    await controller.handleOrderCreated(
      { id: '123abc', message: 'тест' },
      mockContext,
    );

    expect(mockRedis.del).toHaveBeenCalledWith('processed_order:123abc');
  });

  it('missing id', async () => {
    await controller.handleOrderCreated({}, mockContext);

    expect(mockTelegramService.sendMessage).not.toHaveBeenCalled();
  });
});
