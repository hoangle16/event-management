import { Field, Int, ObjectType } from '@nestjs/graphql';
import { User } from './user.model';

@ObjectType()
export class PageInfo {
  @Field(() => Int, { nullable: true })
  total?: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Boolean)
  hasNextPage: boolean;

  @Field(() => String, { nullable: true })
  nextCursor?: string;
}

@ObjectType()
export class UserConnection {
  @Field(() => [User])
  items: User[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
