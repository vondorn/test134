import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { of } from 'rxjs';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  const mockClientProxy = {
    emit: jest.fn(() => of(true)),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('ORDER_SERVICE')
      .useValue(mockClientProxy)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/orders - success', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/orders')
      .send({
        message: 'тест',
      })
      .expect(201);

    expect(response.body).toEqual({
      status: 'Заказ успешно отправлен в очередь',
    });

    expect(mockClientProxy.emit).toHaveBeenCalledWith('order_created', {
      id: expect.any(String),
      message: 'тест',
    });
  });

  it('POST /api/orders - RMQ error', async () => {
    mockClientProxy.emit.mockImplementationOnce(() => {
      throw new Error('RMQ error');
    });

    const response = await request(app.getHttpServer())
      .post('/api/orders')
      .send({
        message: 'тест',
      })
      .expect(500);

    expect(response.body.message).toBe('Сбой при постановке в очередь');
  });

  it('POST /api/orders - validation fail', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/orders')
      .send({
        message: '',
      })
      .expect(400);

    expect(response.body).toEqual({
      error: 'Bad Request',
      message: ['Текст не должен быть пустым'],
      statusCode: 400,
    });
  });
});
