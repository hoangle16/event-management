import { Args, Query, Resolver } from '@nestjs/graphql';
import { User } from './models/user.model';
import { UserService } from './user.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RoleGuard } from '../../common/guards/role.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';

// TODO
@Resolver(() => User)
@UseGuards(JwtAuthGuard, RoleGuard)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [User])
  @Roles(Role.ADMIN, Role.USER)
  async users() {
    return this.userService.getUsers({});
  }

  @Query(() => User)
  @Public()
  async user(@Args('email') email: string) {
    return this.userService.getUser({ email: email });
  }
}
