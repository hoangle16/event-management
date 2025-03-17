import { Module, ValidationPipe } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { GraphQLModule } from './graphql/graphql.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { APP_PIPE } from '@nestjs/core';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    GraphQLModule,
    AuthModule,
    UserModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
