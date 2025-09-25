import { Resolver, Query, Mutation, Arg, Ctx, ID } from 'type-graphql'
import { UserType, CreateUserInput, UpdateUserInput } from '../types'
import { Context } from '../types/context'
import { convertUser } from '../utils/converters'

@Resolver()
export class UserResolver {
  @Query(() => [UserType])
  async users(@Ctx() ctx: Context): Promise<UserType[]> {
    const users = await ctx.prisma.user.findMany()
    return users.map(convertUser)
  }

  @Query(() => UserType, { nullable: true })
  async user(
    @Arg('id', () => ID) id: string,
    @Ctx() ctx: Context
  ): Promise<UserType | null> {
    const user = await ctx.prisma.user.findUnique({
      where: { id }
    })
    return user ? convertUser(user) : null
  }

  @Query(() => UserType, { nullable: true })
  async userByEmail(
    @Arg('email', () => String) email: string,
    @Ctx() ctx: Context
  ): Promise<UserType | null> {
    const user = await ctx.prisma.user.findUnique({
      where: { email }
    })
    return user ? convertUser(user) : null
  }

  @Mutation(() => UserType)
  async createUser(
    @Arg('input', () => CreateUserInput) { name, email, password, phoneNumber }: CreateUserInput,
    @Ctx() ctx: Context
  ): Promise<UserType> {
    const user = await ctx.prisma.user.create({
      data: {
        name,
        email,
        password,
        phoneNumber
      }
    })
    return convertUser(user)
  }

  @Mutation(() => UserType)
  async updateUser(
    @Arg('id', () => ID) id: string,
    @Arg('input', () => UpdateUserInput) input: UpdateUserInput,
    @Ctx() ctx: Context
  ): Promise<UserType> {
    const user = await ctx.prisma.user.update({
      where: { id },
      data: input
    })
    return convertUser(user)
  }

  @Mutation(() => Boolean)
  async deleteUser(
    @Arg('id', () => ID) id: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    await ctx.prisma.user.delete({
      where: { id }
    })
    return true
  }
}
