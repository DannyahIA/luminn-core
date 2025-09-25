import { Field, InputType } from 'type-graphql'

@InputType()
export class CreateTransactionInput {
  @Field(() => String)
  bankId: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => Number, { nullable: true })
  amount?: number

  @Field(() => String, { nullable: true })
  currency?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => Date, { nullable: true })
  transactionDate?: Date
}

@InputType()
export class UpdateTransactionInput {
  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => Number, { nullable: true })
  amount?: number

  @Field(() => String, { nullable: true })
  currency?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => Date, { nullable: true })
  transactionDate?: Date
}
