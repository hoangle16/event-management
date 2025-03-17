import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GraphQLModule as NestGraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { GraphQLContext } from '../common/interfaces/graphql-content.interface';

@Module({
  imports: [
    NestGraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        sortSchema: true,
        playground: false,
        plugins:
          configService.get<string>('nodeEnv') !== 'production'
            ? [ApolloServerPluginLandingPageLocalDefault()]
            : [],
        debug: configService.get<string>('nodeEnv') !== 'production',
        context: ({ req }: GraphQLContext) => ({ req }),
      }),
    }),
  ],
})
export class GraphQLModule {}
