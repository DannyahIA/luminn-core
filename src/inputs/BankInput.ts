import { Field, InputType } from 'type-graphql'

@InputType()
export class CreateBankInput {
  @Field(() => String)
  name: string

  @Field(() => String)
  userId: string
}

@InputType()
export class UpdateBankInput {
  @Field(() => String, { nullable: true })
  name?: string
}

@InputType()
export class CreateBankAccountInput {
  @Field(() => String)
  bankId: string

  @Field(() => String, { nullable: true })
  accountId?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => Number, { nullable: true })
  balance?: number

  @Field(() => String, { nullable: true })
  currencyCode?: string
}

@InputType()
export class UpdateBankAccountInput {
  @Field(() => String, { nullable: true })
  accountId?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => Number, { nullable: true })
  balance?: number

  @Field(() => String, { nullable: true })
  currencyCode?: string
}
