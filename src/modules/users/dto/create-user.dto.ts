import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  password: string;

  @IsString()
  @MinLength(2, { message: 'O nome deve ter no mínimo 2 caracteres' })
  name: string;

  @IsString()
  @MinLength(2, { message: 'O sobrenome deve ter no mínimo 2 caracteres' })
  lastName: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, { message: 'CPF inválido' })
  cpf?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\(\d{2}\) \d{5}-\d{4}$/, { message: 'Telefone inválido' })
  phone?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string | null;

  @IsOptional()
  @IsString()
  @IsEnum(['user', 'admin'], { message: 'Role inválida' })
  role?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['active', 'inactive'], { message: 'Status inválido' })
  status?: 'active' | 'inactive';
}
