import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { RegisterUserInput } from './dto/register-user.dto';
import { EmailService } from '../email/email.service';
import { TokenService } from '../token/token.service';
import { TokenType } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.getUser({ email: email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    if (!user.verified) {
      throw new UnauthorizedException('Email not verified');
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerUser: RegisterUserInput) {
    try {
      const hashedPassword = await bcrypt.hash(registerUser.password, 10);

      return this.prisma.$transaction(async (tx) => {
        const user = await this.userService.createUser(
          {
            ...registerUser,
            password: hashedPassword,
          },
          tx,
        );
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        const verifyToken = await this.tokenService.createToken(
          user.id,
          TokenType.EMAIL_VERIFICATION,
          expiresAt,
          tx,
        );

        await this.emailService.sendVerifyEmail(user.email, verifyToken.token);

        return user;
      });
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  async verifyEmail(token: string) {
    try {
      const verifyToken = await this.tokenService.getToken({
        token,
        type: TokenType.EMAIL_VERIFICATION,
      });

      if (!verifyToken) {
        throw new UnauthorizedException('Invalid token');
      }
      if (verifyToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Token expired');
      }

      const user = await this.userService.getUser({
        id: verifyToken.userId,
      });

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      return this.prisma.$transaction(async (tx) => {
        await this.userService.updateUser(
          {
            where: { id: user.id },
            data: { verified: true },
          },
          tx,
        );
        await this.tokenService.deleteToken({ token }, tx);
      });
    } catch (err) {
      console.error(err);
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new InternalServerErrorException('Failed to verify email');
    }
  }

  async resendVerificationEmail(email: string) {
    const user = await this.userService.getUser({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.verified) {
      throw new BadRequestException('Email already verified');
    }
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    const verifyToken = await this.tokenService.createToken(
      user.id,
      TokenType.EMAIL_VERIFICATION,
      expiresAt,
    );

    await this.emailService.sendVerifyEmail(user.email, verifyToken.token);
  }

  async forgotPassword(email: string) {
    const user = await this.userService.getUser({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    const resetToken = await this.tokenService.createToken(
      user.id,
      TokenType.PASSWORD_RESET,
      expiresAt,
    );

    await this.emailService.sendResetPasswordEmail(
      user.email,
      resetToken.token,
    );
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const resetToken = await this.tokenService.getToken({
        token,
        type: TokenType.PASSWORD_RESET,
      });

      if (!resetToken) {
        throw new UnauthorizedException('Invalid token');
      }
      if (resetToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Token expired');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      return this.prisma.$transaction(async (tx) => {
        await this.userService.updateUser(
          {
            where: { id: resetToken.userId },
            data: { password: hashedPassword },
          },
          tx,
        );
        await this.tokenService.deleteToken({ token }, tx);
      });
    } catch (err) {
      console.error(err);
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new InternalServerErrorException('Failed to reset password');
    }
  }
}
