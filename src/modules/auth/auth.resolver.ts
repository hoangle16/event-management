import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { RegisterUserInput } from './dto/register-user.dto';
import GraphQLJSON from 'graphql-type-json';

@Resolver('auth')
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => GraphQLJSON)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ) {
    const { access_token } = await this.authService.login(email, password);
    return { access_token };
  }

  @Mutation(() => GraphQLJSON)
  async register(
    @Args('registerUserData') registerUserData: RegisterUserInput,
  ) {
    await this.authService.register(registerUserData);
    return {
      message:
        'Registration successful! Please check your email to verify your email.',
    };
  }

  @Mutation(() => GraphQLJSON)
  async verifyEmail(@Args('token') token: string) {
    await this.authService.verifyEmail(token);
    return { message: 'Email verified successfully!' };
  }

  @Mutation(() => GraphQLJSON)
  async resendVerificationEmail(@Args('email') email: string) {
    await this.authService.resendVerificationEmail(email);
    return { message: 'Verification email sent successfully!' };
  }

  @Mutation(() => GraphQLJSON)
  async forgotPassword(@Args('email') email: string) {
    await this.authService.forgotPassword(email);
    return { message: 'Password reset email sent successfully!' };
  }

  @Mutation(() => GraphQLJSON)
  async resetPassword(
    @Args('token') token: string,
    @Args('newPassword') newPassword: string,
  ) {
    await this.authService.resetPassword(token, newPassword);
    return { message: 'Password reset successfully!' };
  }
}
