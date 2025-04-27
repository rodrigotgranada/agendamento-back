import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Token de autenticação do Firebase',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ...',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;
}
