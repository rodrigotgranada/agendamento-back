export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  STAFF = 'staff',
}

export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
}

export interface User {
  id: string;
  cpf: string;
  createdAt: Date;
  createdBy: string;
  email: string;
  lastName: string;
  name: string;
  password: string;
  phone: string;
  photoUrl: string | null;
  role: UserRole;
  status: UserStatus;
  updatedAt: Date;
  updatedBy: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  lastName: string;
  cpf?: string;
  phone?: string;
  photoUrl?: string | null;
  role?: UserRole;
  status?: UserStatus;
  createdBy?: string;
  updatedBy?: string;
}
