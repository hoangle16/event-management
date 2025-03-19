import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, MinLength } from 'class-validator';
import { Match } from '../../../common/decorators/match.decorator';
import { NotMatch } from '../../../common/decorators/not-match.decorator';

@InputType()
export class ChangePassInput {
  @Field()
  @IsNotEmpty()
  currentPassword: string;

  @Field()
  @MinLength(6)
  @NotMatch('currentPassword')
  newPassword: string;

  @Field()
  @Match('newPassword')
  confirmPassword: string;
}
