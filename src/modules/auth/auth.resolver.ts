import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { User } from '../user/models/user.model';
import { RegisterUserInput } from './dto/register-user.dto';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => String)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ) {
    const { access_token } = await this.authService.login(email, password);
    return access_token;
  }

  @Mutation(() => User)
  async register(
    @Args('registerUserData') registerUserData: RegisterUserInput,
  ) {
    return this.authService.register(registerUserData);
  }
}
