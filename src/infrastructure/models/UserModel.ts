import { Schema, model, Document } from 'mongoose';

interface IUserDocument extends Document {
  firstName: string;
  lastName: string;
  cpf: string;
  phone: string;
  email: string;
  password: string;
  role: 'user' | 'admin' | 'owner';
  isActive: 'pending' | 'active' | 'blocked';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  cpf: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'owner'], default: 'user' },
  isActive: { type: String, enum: ['pending', 'active', 'blocked'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const UserModel = model<IUserDocument>('User', UserSchema);

export { UserModel, IUserDocument };
