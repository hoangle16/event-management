import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

export type PrismaClientOrTransaction =
  | PrismaService
  | Prisma.TransactionClient;
