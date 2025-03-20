import { registerEnumType } from '@nestjs/graphql';

export enum UserSortField {
  ID = 'id',
  EMAIL = 'email',
  FULL_NAME = 'fullName',
  ROLE = 'role',
  VERIFIED = 'verified',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

registerEnumType(UserSortField, {
  name: 'UserSortField',
  description: 'Sort fields for users',
});
