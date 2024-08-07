export interface CreateUserDTO {
    firstName: string;
    lastName: string;
    cpf: string;
    phone: string;
    email: string;
    password: string;
    role?: 'user' | 'admin' | 'owner';
  }
  