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
  role: string;
  status: 'active' | 'inactive';
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
  role?: string;
  status?: 'active' | 'inactive';
  createdBy?: string;
  updatedBy?: string;
}
