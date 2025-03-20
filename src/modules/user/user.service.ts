import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma, User } from '@prisma/client';
import { PrismaClientOrTransaction } from '../../common/interfaces/prisma.interface';
import { ChangePassInput } from './dto/change-pass.input';
import * as bcrypt from 'bcryptjs';
import { GetUsersInput, UserSort } from './dto/get-users.input';
import { UserConnection } from './models/user-connection.model';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUsers(input: GetUsersInput): Promise<UserConnection> {
    const { search, filters, page = 1, limit = 10, sorts, cursor } = input;

    let where: Prisma.UserWhereInput = {};

    if (search) {
      where = {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    if (filters && filters.length > 0) {
      const filterConditions: Prisma.UserWhereInput[] = filters.map(
        (filter) => {
          const { field, value } = filter;
          return { [field]: { equals: value } };
        },
      );

      where = {
        AND: [...filterConditions, ...(where.OR ? [{ OR: where.OR }] : [])],
      };
    }

    const orderBy = this.buildOrderBy(sorts);

    let cursorObj: Prisma.UserWhereUniqueInput | undefined;
    if (cursor) {
      cursorObj = { id: cursor };
    }

    const skip = cursor ? 1 : (page - 1) * limit;
    const take = limit + 1;

    const users = await this.prisma.user.findMany({
      where,
      orderBy,
      skip,
      take,
      cursor: cursorObj,
    });

    const hasNextPage = users.length > limit;
    const items = hasNextPage ? users.slice(0, limit) : users;

    const total = cursor ? undefined : await this.prisma.user.count({ where });

    const nextCursor = hasNextPage ? items[items.length - 1].id : undefined;

    return {
      items,
      pageInfo: {
        total,
        page,
        limit,
        hasNextPage,
        nextCursor,
      },
    };
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

  // Private methods
  private buildOrderBy(
    sort?: UserSort[],
  ):
    | Prisma.UserOrderByWithRelationInput
    | Prisma.UserOrderByWithRelationInput[] {
    if (!sort || sort.length === 0) {
      return { createdAt: 'desc' };
    }

    if (sort.length === 1) {
      const { field, direction } = sort[0];
      return { [field]: direction };
    }

    return sort.map(({ field, direction }) => ({ [field]: direction }));
  }
}
