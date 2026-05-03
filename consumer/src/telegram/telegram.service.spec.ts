import { Test, TestingModule } from '@nestjs/testing';
import { TelegramService } from './telegram.service';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { Telegraf } from 'telegraf';

jest.mock('telegraf', () => {
  return {
    Telegraf: jest.fn().mockImplementation(() => ({
      telegram: {
        sendMessage: jest.fn(),
      },
    })),
  };
});

describe('TelegramService', () => {
  let service: TelegramService;
  let configService: ConfigService;
  let mockTelegrafInstance: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelegramService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'TG_BOT_TOKEN') return 'fake-token';
              if (key === 'TG_CHAT_ID') return '123abc';
              return null;
            }),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TelegramService>(TelegramService);
    configService = module.get<ConfigService>(ConfigService);

    mockTelegrafInstance = (Telegraf as unknown as jest.Mock).mock.results[0]
      .value;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendMessage', () => {
    it('should call sendMessage with correct parameters', async () => {
      const message = 'Test message';
      mockTelegrafInstance.telegram.sendMessage.mockResolvedValue({});

      await service.sendMessage(message);

      expect(mockTelegrafInstance.telegram.sendMessage).toHaveBeenCalledWith(
        '123abc',
        message,
        { parse_mode: 'HTML' },
      );
    });

    it('should throw and log error if sendMessage fails', async () => {
      const error = new Error('API Error');
      mockTelegrafInstance.telegram.sendMessage.mockRejectedValue(error);

      await expect(service.sendMessage('fail')).rejects.toThrow('API Error');
    });
  });

  describe('Initialization', () => {
    it('should throw error if config is missing', () => {
      jest.spyOn(configService, 'get').mockReturnValue(null);

      expect(() => new TelegramService(configService)).toThrow(
        'Ошибка конфигурации Telegram',
      );
    });
  });
});
