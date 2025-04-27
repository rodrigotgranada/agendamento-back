import { Injectable } from '@nestjs/common';
import { FirebaseAdmin } from './firebase.config';
import { User } from '@/types/users';

interface FirestoreUserData {
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

interface FirestoreDocument {
  id: string;
  data: () => FirestoreUserData;
  exists: boolean;
}

interface FirestoreCollection {
  doc: (id: string) => FirestoreDocument;
  get: () => Promise<FirestoreDocument[]>;
}

export interface Firestore {
  collection: (name: string) => FirestoreCollection;
}

@Injectable()
export class FirebaseService {
  private firestore: Firestore;

  constructor() {
    FirebaseAdmin.initialize();
    this.firestore = FirebaseAdmin.getFirestore() as unknown as Firestore;
  }

  getFirestore(): Firestore {
    return this.firestore;
  }

  async listAllUsers(): Promise<User[]> {
    try {
      const usersSnapshot = await this.firestore.collection('users').get();
      const users: User[] = [];

      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        const user: User = {
          id: doc.id,
          cpf: data.cpf,
          createdAt: data.createdAt,
          createdBy: data.createdBy,
          email: data.email,
          lastName: data.lastName,
          name: data.name,
          password: data.password,
          phone: data.phone,
          photoUrl: data.photoUrl,
          role: data.role,
          status: data.status,
          updatedAt: data.updatedAt,
          updatedBy: data.updatedBy,
        };
        users.push(user);
      });

      return users;
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      throw new Error('Erro ao listar usuários');
    }
  }
}
