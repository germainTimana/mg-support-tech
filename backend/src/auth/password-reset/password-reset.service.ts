import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { PasswordReset, PasswordResetDocument } from '../schemas/password-reset.schema';
import { UsersService } from '../../users/users.service';
import { BadRequestDomainException } from '../../common/exceptions/domain.exception';

@Injectable()
export class PasswordResetService {
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectModel(PasswordReset.name)
    private resetModel: Model<PasswordResetDocument>,
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'smtp.ethereal.email'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER', ''),
        pass: this.configService.get<string>('SMTP_PASS', ''),
      },
    });
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return { message: 'Si el correo existe, recibirás un enlace de recuperación' };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(rawToken, 10);

    await this.resetModel.create({
      email: email.toLowerCase(),
      token: hashedToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');
    const resetLink = `${appUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('SMTP_FROM', 'noreply@mg-support-tech.com'),
        to: email,
        subject: 'Recuperación de contraseña - MG Support Tech',
        html: `
          <h2>Recuperación de contraseña</h2>
          <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
          <a href="${resetLink}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;">
            Restablecer contraseña
          </a>
          <p>Este enlace expira en 1 hora.</p>
          <p>Si no solicitaste esto, ignora este mensaje.</p>
        `,
      });
    } catch {
      // Si falla el email, el usuario no recibe notificación pero no exponemos info sensible
    }

    return { message: 'Si el correo existe, recibirás un enlace de recuperación' };
  }

  async resetPassword(token: string, email: string, newPassword: string): Promise<{ message: string }> {
    const tokens = await this.resetModel
      .find({
        email: email.toLowerCase(),
        used: false,
        expiresAt: { $gt: new Date() },
      })
      .sort({ createdAt: -1 })
      .exec();

    if (!tokens.length) {
      throw new BadRequestDomainException('Token inválido o expirado');
    }

    let validToken: PasswordResetDocument | null = null;
    for (const t of tokens) {
      const match = await bcrypt.compare(token, t.token);
      if (match) {
        validToken = t;
        break;
      }
    }

    if (!validToken) {
      throw new BadRequestDomainException('Token inválido o expirado');
    }

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestDomainException('Token inválido o expirado');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(user._id.toString(), hashed);
    await this.resetModel.updateMany(
      { email: email.toLowerCase(), used: false },
      { $set: { used: true } },
    );

    return { message: 'Contraseña restablecida exitosamente' };
  }
}
