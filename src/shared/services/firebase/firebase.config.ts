import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { Firestore } from './firebase.interface';

dotenv.config();

export class FirebaseAdmin {
  private static app: admin.app.App;

  public static initialize() {
    if (this.app) {
      console.log('Firebase já inicializado.');
      return this.app;
    }

    const serviceAccountPath = process.env.FIREBASE_CREDENTIALS_PATH;
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

    // console.log('Configuração do Firebase:');
    // console.log('Service Account Path:', serviceAccountPath);
    // console.log('Storage Bucket:', storageBucket);

    if (!serviceAccountPath) {
      throw new Error('FIREBASE_CREDENTIALS_PATH não definido no .env');
    }

    const fullPath = path.join(process.cwd(), serviceAccountPath);
    // console.log('Caminho completo do arquivo:', fullPath);

    if (!fs.existsSync(fullPath)) {
      throw new Error(`Arquivo de credenciais não encontrado em: ${fullPath}`);
    }

    const rawCredentials = fs.readFileSync(fullPath, 'utf8');
    // console.log('Conteúdo do arquivo de credenciais:', rawCredentials);

    const serviceAccount = JSON.parse(rawCredentials) as admin.ServiceAccount;

    console.log('Credenciais carregadas:', serviceAccount?.project_id);

    try {
      this.app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket,
      });
      console.log('Firebase inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar o Firebase:', error);
      throw error;
    }

    return this.app;
  }

  public static getFirestore(): Firestore {
    if (!this.app) {
      this.initialize();
    }
    return admin.firestore() as unknown as Firestore;
  }

  public static getStorageBucket() {
    if (!this.app) {
      this.initialize();
    }
    return admin.storage().bucket();
  }

  public static getAuth() {
    if (!this.app) {
      this.initialize();
    }
    return admin.auth();
  }
}
