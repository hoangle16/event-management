import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('email.host'),
      port: this.configService.get<number>('email.port'),
      auth: {
        user: this.configService.get<string>('email.auth.user'),
        pass: this.configService.get<string>('email.auth.pass'),
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string) {
    await this.transporter.sendMail({
      from: this.configService.get<string>('email.from'),
      to,
      subject,
      html,
    });
  }

  async sendVerifyEmail(to: string, token: string) {
    // TODO: change template
    const html = `
      <h1>Verify your email</h1>
      <p>Verify token: ${token}</p>
    `;

    await this.sendEmail(to, 'Verify Email', html);
  }

  async sendResetPasswordEmail(to: string, token: string) {
    // TODO: change template
    const html = `
      <h1>Reset your password</h1>
      <p>Reset token: ${token}</p>
    `;
    await this.sendEmail(to, 'Reset Password', html);
  }
}
