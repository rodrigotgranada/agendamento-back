import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail', // ou outro serviço de email, como Yahoo, Outlook, etc.
      auth: {
        user: process.env.EMAIL_USER, // Seu email
        pass: process.env.EMAIL_PASS, // Sua senha de email ou token de app
      },
    });
  }

  async sendVerificationEmail(to: string, code: string): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: 'Código de Verificação',
      text: `Seu código de verificação é ${code}`,
    };

    await this.transporter.sendMail(mailOptions);
  }

  // Adicione outros métodos de envio de email conforme necessário
}
