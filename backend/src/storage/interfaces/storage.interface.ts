export interface FileMetadata {
  originalName: string;
  mimeType: string;
  size: number;
  userId: string;
}

export interface IStorageService {
  upload(file: Buffer, metadata: FileMetadata): Promise<string>;
  download(fileId: string): Promise<Buffer>;
  delete(fileId: string): Promise<void>;
  getUrl(fileId: string): Promise<string>;
}
