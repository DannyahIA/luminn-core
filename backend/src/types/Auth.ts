import { Field, ObjectType, InputType } from 'type-graphql'
import { UserType } from './User'

@ObjectType()
export class AuthResponse {
  @Field(() => String)
  token: string

  @Field(() => UserType)
  user: UserType
}

@ObjectType()
export class LoginResponse {
  @Field(() => String)
  token: string

  @Field(() => UserType)
  user: UserType
}

@InputType()
export class RegisterInput {
  @Field(() => String)
  name: string

  @Field(() => String)
  email: string

  @Field(() => String)
  password: string

  @Field(() => String, { nullable: true })
  phoneNumber?: string
}

@InputType()
export class LoginInput {
  @Field(() => String)
  email: string

  @Field(() => String)
  password: string
}
