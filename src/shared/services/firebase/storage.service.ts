import { Injectable } from '@nestjs/common';
import { FirebaseAdmin } from './firebase.config';
import { Bucket } from '@google-cloud/storage';
import { StorageService as IStorageService } from './storage.interface';

@Injectable()
export class StorageService implements IStorageService {
  private readonly bucket: Bucket;

  constructor() {
    this.bucket = FirebaseAdmin.getStorageBucket();
  }

  private async createKeepFile(userId: string): Promise<void> {
    const keepFilePath = `profile_pictures/${userId}/.keep`;
    const [exists] = await this.bucket.file(keepFilePath).exists();

    if (!exists) {
      await this.bucket.file(keepFilePath).save(userId, {
        contentType: 'text/plain',
      });
    }
  }

  async uploadProfilePicture(
    userId: string,
    file: {
      buffer: Buffer;
      mimetype: string;
    },
  ): Promise<string> {
    if (!userId || !file?.buffer || !file?.mimetype) {
      throw new Error('Parâmetros inválidos para upload');
    }

    try {
      const filePath = `profile_pictures/${userId}/picture.png`;
      const fileUpload = this.bucket.file(filePath);
      const stream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      return new Promise<string>((resolve, reject) => {
        stream.on('error', (error: Error) => {
          console.error('Erro ao fazer upload da imagem:', error);
          reject(new Error(`Falha no upload: ${error.message}`));
        });

        stream.on('finish', () => {
          fileUpload
            .makePublic()
            .then(() => {
              const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${filePath}`;
              resolve(publicUrl);
            })
            .catch((error) => {
              const err = error as Error;
              console.error('Erro ao tornar arquivo público:', err);
              reject(
                new Error(`Falha ao tornar arquivo público: ${err.message}`),
              );
            });
        });

        stream.end(file.buffer);
      });
    } catch (error) {
      const err = error as Error;
      console.error('Erro ao fazer upload da imagem:', err);
      throw new Error(`Erro no serviço de storage: ${err.message}`);
    }
  }

  async uploadFile(
    buffer: Buffer,
    path: string,
    contentType: string,
  ): Promise<string> {
    const userId = path.split('/')[1]; // Extrai o ID do usuário do caminho
    await this.createKeepFile(userId);

    const file = this.bucket.file(path);
    await file.save(buffer, { contentType });
    return file.publicUrl();
  }

  async deleteFile(path: string): Promise<void> {
    try {
      const userId = path.split('/')[1]; // Extrai o ID do usuário do caminho
      const [files] = await this.bucket.getFiles({
        prefix: `profile_pictures/${userId}/`,
        delimiter: '/',
      });

      // Filtra para excluir apenas arquivos que não sejam o .keep
      const filesToDelete = files.filter(
        (file) => !file.name.endsWith('.keep'),
      );

      if (filesToDelete.length > 0) {
        await Promise.all(filesToDelete.map((file) => file.delete()));
      }
    } catch (error) {
      console.error('Erro ao excluir arquivo:', error);
      throw error;
    }
  }
}
