import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { ServicesService } from '../../shared/services/services.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly jwtService: JwtService,
  ) {}
}
