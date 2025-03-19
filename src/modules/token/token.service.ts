import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma, TokenType } from '@prisma/client';
import * as crypto from 'crypto';
import { PrismaClientOrTransaction } from '../../common/interfaces/prisma.interface';

@Injectable()
export class TokenService {
  constructor(private prisma: PrismaService) {}

  async createToken(
    userId: string,
    type: TokenType,
    expiresAt: Date,
    prisma: PrismaClientOrTransaction = this.prisma,
  ) {
    const token = crypto.randomBytes(32).toString('hex');
    const verifyToken = await prisma.verificationToken.create({
      data: { userId, token, type, expiresAt },
    });
    return verifyToken;
  }

  async getToken(where: Prisma.VerificationTokenWhereUniqueInput) {
    return this.prisma.verificationToken.findUnique({
      where,
    });
  }

  async deleteToken(
    where: Prisma.VerificationTokenWhereUniqueInput,
    prisma: PrismaClientOrTransaction = this.prisma,
  ) {
    return prisma.verificationToken.delete({ where });
  }

  async deleteExpiredTokens(prisma: PrismaClientOrTransaction = this.prisma) {
    const now = new Date();
    return prisma.verificationToken.deleteMany({
      where: { expiresAt: { lte: now } },
    });
  }
}
