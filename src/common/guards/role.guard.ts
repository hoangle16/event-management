import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GraphQLContext } from '../interfaces/graphql-content.interface';
import { ForbiddenError } from '@nestjs/apollo';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext<GraphQLContext>().req.user;
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenError(
        'You do not have permission to perform this action',
      );
    }

    return true;
  }
}
