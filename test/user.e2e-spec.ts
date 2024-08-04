import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TwilioService } from '../src/twilio/twilio.service';
import { MockTwilioService } from '../src/twilio/twilio.mock';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(TwilioService)
      .useClass(MockTwilioService)
      .compile();

    app = moduleFixture.createNestApplication();
    jwtService = moduleFixture.get<JwtService>(JwtService);
    await app.init();

    // Register a new user and get the user ID
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'testpassword',
        cpf: '12345678900',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
      });

    userId = response.body._id;
  });

  it('/users (GET)', async () => {
    const token = jwtService.sign({ email: 'test@example.com', sub: userId });

    return request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/users/:id (GET)', async () => {
    const token = jwtService.sign({ email: 'test@example.com', sub: userId });

    return request(app.getHttpServer())
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('email', 'test@example.com');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
