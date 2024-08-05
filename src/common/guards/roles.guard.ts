import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const [, token] = authHeader.split(' ');

    try {
      const decoded = this.jwtService.verify(token);
      const userRole = decoded.role;
      if (!userRole) {
        throw new UnauthorizedException('Role not found in token');
      }

      return roles.includes(userRole);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
