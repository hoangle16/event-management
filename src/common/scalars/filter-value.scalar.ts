import { CustomScalar, Scalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('FilterValue')
export class FilterValueScalar
  implements CustomScalar<string, string | boolean | number>
{
  description = 'Filter Value custom scalar type';

  parseValue(value: unknown): string | boolean | number {
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return value;
    }
    throw new Error(`Invalid FilterValue: ${String(value)}`);
  }

  serialize(value: string | boolean | number): string {
    return String(value);
  }

  parseLiteral(ast: ValueNode): string | boolean | number {
    switch (ast.kind) {
      case Kind.STRING:
        return ast.value;
      case Kind.INT:
      case Kind.FLOAT:
        return Number(ast.value);
      case Kind.BOOLEAN:
        return ast.value;
      default:
        throw new Error(`Invalid FilterValue literal: ${ast.kind}`);
    }
  }
}
