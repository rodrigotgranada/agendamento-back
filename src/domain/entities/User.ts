export class User {
    constructor(
      public id: string,
      public firstName: string,
      public lastName: string,
      public cpf: string,
      public phone: string,
      public email: string,
      public password: string,
      public role: 'user' | 'admin' | 'owner',
      public isActive: 'pending' | 'active' | 'blocked',
      public createdAt: Date,
      public updatedAt: Date
    ) {}
  }
  