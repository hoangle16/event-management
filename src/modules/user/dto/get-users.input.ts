import { Field, InputType, Int } from '@nestjs/graphql';
import { SortDirection } from '../../../common/enums/common.enum';
import { UserSortField } from '../../../common/enums/user.enum';
import { FilterValueScalar } from '../../../common/scalars/filter-value.scalar';

@InputType()
export class GetUsersInput {
  @Field({ nullable: true })
  search?: string;

  @Field(() => [UsersFilter], { nullable: true })
  filters: UsersFilter[];

  @Field(() => [UserSort], { nullable: true })
  sorts?: UserSort[];

  @Field(() => Int, { nullable: true, defaultValue: 1 })
  page: number;

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  limit: number;

  @Field(() => String, { nullable: true })
  cursor?: string;
}

@InputType()
export class UsersFilter {
  @Field(() => String)
  field: string;

  @Field(() => FilterValueScalar, { nullable: true })
  value?: string | boolean | number;
}

@InputType()
export class UserSort {
  @Field(() => UserSortField)
  field: UserSortField;

  @Field(() => SortDirection, { defaultValue: SortDirection.ASC })
  direction: SortDirection;
}
