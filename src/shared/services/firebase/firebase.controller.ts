import { Controller, Get } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Controller('firebase')
export class FirebaseController {
  constructor(private readonly firebaseService: FirebaseService) {
    console.log('FirebaseController inicializado');
  }

  @Get('test-connection')
  testConnection() {
    console.log('Rota test-connection chamada');
    try {
      // Tenta acessar o Firestore para testar a conexão
      const firestore = this.firebaseService.getFirestore();
      if (firestore) {
        console.log('Firestore obtido com sucesso');
      }

      return {
        success: true,
        message: 'Conexão com o Firebase estabelecida com sucesso',
      };
    } catch (error: unknown) {
      console.error('Erro ao conectar com o Firebase:', error);
      return {
        success: false,
        message: 'Erro ao conectar com o Firebase',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }
}
