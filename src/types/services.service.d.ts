import { User } from '@/types/users';

export interface ServicesService {
  listAllUsers(): Promise<User[]>;
}
