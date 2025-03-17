import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, MinLength } from 'class-validator';
import { AvailableRoles } from '@/common/enums/role.enum';

@InputType()
export class RegisterUserInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @MinLength(6)
  password: string;

  @Field()
  @MinLength(4)
  fullName: string;

  @Field(() => AvailableRoles)
  role: AvailableRoles;
}
