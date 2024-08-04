export interface IUser {
  _id: string;
  email: string;
  password: string;
  cpf: string;
  firstName: string;
  lastName: string;
  phone: string;
  photo?: string;
  role: string;
  active: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}
