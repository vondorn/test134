import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { InternalServerErrorException, Logger } from '@nestjs/common';

describe('ProducerAppController', () => {
  let controller: AppController;
  let service: AppService;

  const mockAppService = {
    createOrder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
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

    controller = module.get<AppController>(AppController);
    service = module.get<AppService>(AppService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrder', () => {
    const testDto: CreateOrderDto = {
      message: 'Тестовый заказ',
    };

    it('success', async () => {
      mockAppService.createOrder.mockResolvedValue({
        status: 'Заказ успешно отправлен в очередь',
      });

      const result = await controller.createOrder(testDto);

      expect(service.createOrder).toHaveBeenCalledWith(testDto);
      expect(result).toEqual({ status: 'Заказ успешно отправлен в очередь' });
    });

    it('InternalServerErrorException', async () => {
      mockAppService.createOrder.mockRejectedValue(new Error('Queue error'));

      await expect(controller.createOrder(testDto)).rejects.toThrow(
        InternalServerErrorException,
      );

      await expect(controller.createOrder(testDto)).rejects.toThrow(
        'Сбой при постановке в очередь',
      );
    });

    it('Other error', async () => {
      mockAppService.createOrder.mockRejectedValue('other error');

      await expect(controller.createOrder(testDto)).rejects.toThrow(
        InternalServerErrorException,
      );

      await expect(controller.createOrder(testDto)).rejects.toThrow(
        'Сбой при постановке в очередь',
      );
    });
  });
});
