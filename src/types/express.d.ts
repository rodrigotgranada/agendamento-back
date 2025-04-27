declare namespace Express {
  export interface Request {
    user?: any;
  }
  export interface Multer {
    File: {
      buffer: Buffer;
      mimetype: string;
      originalname: string;
    };
  }
}
