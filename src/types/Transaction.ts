import { Field, ObjectType, ID } from 'type-graphql'
import { Decimal } from '@prisma/client/runtime/library'

@ObjectType()
export class TransactionType {
  @Field(() => ID)
  id: string

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date

  @Field(() => String)
  bankId: string

  @Field(() => String, { nullable: true })
  type?: string | null

  @Field(() => Number, { nullable: true })
  amount?: Decimal | null

  @Field(() => String, { nullable: true })
  currency?: string | null

  @Field(() => String, { nullable: true })
  description?: string | null

  @Field(() => Date, { nullable: true })
  transactionDate?: Date | null
}
