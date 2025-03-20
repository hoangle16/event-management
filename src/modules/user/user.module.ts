import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { DatabaseModule } from '../../database/database.module';
import { UserResolver } from './user.resolver';
import { FilterValueScalar } from '../../common/scalars/filter-value.scalar';

@Module({
  imports: [DatabaseModule],
  providers: [UserService, UserResolver, FilterValueScalar],
  exports: [UserService],
})
export class UserModule {}
