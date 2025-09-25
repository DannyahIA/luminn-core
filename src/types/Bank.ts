import { Field, ObjectType, ID } from 'type-graphql'
import { Decimal } from '@prisma/client/runtime/library'

@ObjectType()
export class BankType {
  @Field(() => ID)
  id: string

  @Field(() => String, { nullable: true })
  name?: string | null

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date

  @Field(() => String)
  userId: string
}

@ObjectType()
export class BankAccountType {
  @Field(() => ID)
  id: string

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date

  @Field(() => String)
  userId: string

  @Field(() => String)
  bankId: string

  @Field(() => String, { nullable: true })
  accountId?: string | null

  @Field(() => String, { nullable: true })
  type?: string | null

  @Field(() => Number, { nullable: true })
  balance?: Decimal | null

  @Field(() => String, { nullable: true })
  currencyCode?: string | null
}
