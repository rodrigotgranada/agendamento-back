import { User } from '@/types/users';
import { Timestamp } from 'firebase-admin/firestore';

export interface FirestoreUserData
  extends Omit<User, 'id' | 'createdAt' | 'updatedAt'> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreDocument {
  id: string;
  data: () => FirestoreUserData;
  exists: boolean;
  set: (data: Partial<FirestoreUserData>) => Promise<void>;
  get: () => Promise<FirestoreDocument>;
  update: (data: Partial<FirestoreUserData>) => Promise<void>;
}

export interface FirestoreCollection {
  doc: (id?: string) => FirestoreDocument;
  get: () => Promise<FirestoreDocument[]>;
}

export interface Firestore {
  collection(
    collectionPath: string,
  ): FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
}
