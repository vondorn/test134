import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';
import { of, throwError, TimeoutError } from 'rxjs';
import * as uuid from 'uuid';
import { Logger } from '@nestjs/common';

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('AppService', () => {
  let service: AppService;
  let client: ClientProxy;

  const mockClientProxy = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: 'ORDER_SERVICE',
          useValue: mockClientProxy,
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

    service = module.get<AppService>(AppService);
    client = module.get<ClientProxy>('ORDER_SERVICE');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('success', async () => {
      const dto = { message: 'тест' };
      const fakeUuid = '1234-uuid';
      const rabbitResponse = { acknowledged: true };

      (uuid.v4 as jest.Mock).mockReturnValue(fakeUuid);
      mockClientProxy.emit.mockReturnValue(of(rabbitResponse));

      const result = await service.createOrder(dto);

      expect(client.emit).toHaveBeenCalledWith('order_created', {
        id: fakeUuid,
        message: dto.message,
      });

      expect(result).toEqual(rabbitResponse);
    });

    it('RabbitMQ time out', async () => {
      const dto = { message: 'тест' };

      mockClientProxy.emit.mockReturnValue(
        throwError(() => new TimeoutError()),
      );

      await expect(service.createOrder(dto)).rejects.toThrow(TimeoutError);
    });
  });
});
