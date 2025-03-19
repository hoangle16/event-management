import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma, User } from '@prisma/client';
import { PrismaClientOrTransaction } from '../../common/interfaces/prisma.interface';
import { ChangePassInput } from './dto/change-pass.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUsers(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({ skip, take, cursor, where, orderBy });
  }
  async getUser(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({ where: userWhereUniqueInput });
  }

  async createUser(
    data: Prisma.UserCreateInput,
    prisma: PrismaClientOrTransaction = this.prisma,
  ) {
    if (await prisma.user.findUnique({ where: { email: data.email } })) {
      throw new Error('User with this email already exists');
    }
    return prisma.user.create({ data });
  }

  async updateUser(
    params: {
      where: Prisma.UserWhereUniqueInput;
      data: Prisma.UserUpdateInput;
    },
    prisma: PrismaClientOrTransaction = this.prisma,
  ) {
    const { where, data } = params;
    return prisma.user.update({ data, where });
  }

  async changePassword(
    params: {
      id: string;
      data: Omit<ChangePassInput, 'confirmPassword'>;
    },
    prisma: PrismaClientOrTransaction = this.prisma,
  ) {
    const { id, data } = params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      data.currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    return prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  async deleteUser(
    where: Prisma.UserWhereUniqueInput,
    prisma: PrismaClientOrTransaction = this.prisma,
  ) {
    return prisma.user.delete({ where });
  }
}
