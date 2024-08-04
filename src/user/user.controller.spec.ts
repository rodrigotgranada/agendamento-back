import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let userService = { findByEmail: () => ({ email: 'test@test.com', password: 'test' }) };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UserService)
      .useValue(userService)
      .compile();

    app = moduleFixture.createNestApplication();
    jwtService = moduleFixture.get<JwtService>(JwtService);
    await app.init();
  });

  it('/users (GET)', async () => {
    const token = jwtService.sign({ email: 'test@test.com', sub: '123' });

    return request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/users/:id (GET)', async () => {
    const token = jwtService.sign({ email: 'test@test.com', sub: '123' });

    return request(app.getHttpServer())
      .get('/users/123')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('email', 'test@test.com');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
