import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TwilioService } from '../src/twilio/twilio.service';
import { MockTwilioService } from '../src/twilio/twilio.mock';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(TwilioService)
      .useClass(MockTwilioService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/register (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'testpassword',
        cpf: '12345678900',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.email).toEqual('test@example.com');
      });
  });

  it('/auth/login (POST)', async () => {
    // Ensure the user is registered before login
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'testpassword',
        cpf: '12345678900',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
      });

    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'testpassword' })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('access_token');
      });
  });

  it('/auth/forgot-password (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send({ email: 'test@example.com' })
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toEqual('Password reset link sent');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
