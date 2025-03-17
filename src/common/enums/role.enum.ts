import { Role } from '@prisma/client';
import { registerEnumType } from '@nestjs/graphql';

registerEnumType(Role, {
  name: 'Role',
  description: 'User roles available in the system',
});

enum AvailableRoles {
  ORGANIZER = 'ORGANIZER',
  USER = 'USER',
}

registerEnumType(AvailableRoles, {
  name: 'AvailableRole',
  description: 'Roles available for general users (excluding ADMIN)',
});

export { Role, AvailableRoles };
