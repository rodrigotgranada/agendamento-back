export interface StorageService {
  uploadFile(
    buffer: Buffer,
    path: string,
    contentType: string,
  ): Promise<string>;
  deleteFile(path: string): Promise<void>;
}
