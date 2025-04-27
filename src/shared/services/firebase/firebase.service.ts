import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { User, CreateUserDto } from '@/types/users';
import { FirebaseAdmin } from './firebase.config';
import { Firestore, FirestoreUserData } from './firebase.interface';

@Injectable()
export class FirebaseService {
  private readonly firestore: Firestore;

  constructor() {
    FirebaseAdmin.initialize();
    this.firestore = FirebaseAdmin.getFirestore();
  }

  async createUser(userData: CreateUserDto): Promise<User> {
    const { email, name, lastName } = userData;

    const userDoc: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
      email,
      name,
      lastName,
      password: userData.password || '',
      cpf: userData.cpf || '',
      createdBy: userData.createdBy || '',
      phone: userData.phone || '',
      photoUrl: userData.photoUrl || '',
      role: userData.role || 'user',
      status: userData.status || 'active',
      updatedBy: userData.updatedBy || '',
    };

    const userRef = this.firestore.collection('users').doc();
    await userRef.set({
      ...userDoc,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      id: userRef.id,
      ...userDoc,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async listAllUsers(): Promise<User[]> {
    const usersSnapshot = await this.firestore.collection('users').get();
    const users: User[] = [];

    usersSnapshot.forEach((doc) => {
      const data = doc.data() as User;
      users.push({
        ...data,
        id: doc.id,
      });
    });

    return users;
  }

  async updateUser(
    userId: string,
    userData: Partial<Omit<User, 'createdAt' | 'updatedAt'>>,
  ): Promise<User> {
    const userRef = this.firestore.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error('Usuário não encontrado');
    }

    const updateData: Partial<FirestoreUserData> = {
      ...userData,
      updatedAt: admin.firestore.Timestamp.now(),
    };

    await userRef.update(updateData);

    const updatedUser = await userRef.get();
    return {
      id: userId,
      ...(updatedUser.data() as User),
    };
  }

  getFirestore(): Firestore {
    return this.firestore;
  }
}
