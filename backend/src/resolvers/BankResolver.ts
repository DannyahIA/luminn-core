import { Resolver, Query, Mutation, Arg, Ctx, ID } from 'type-graphql'
import { BankType, BankAccountType, CreateBankInput, UpdateBankInput, CreateBankAccountInput, UpdateBankAccountInput } from '../types'
import { Context } from '../types/context'
import { convertBank, convertBankAccount } from '../utils/converters'

@Resolver()
export class BankResolver {
  @Query(() => [BankType])
  async banks(@Ctx() ctx: Context): Promise<BankType[]> {
    const banks = await ctx.prisma.bank.findMany()
    return banks.map(convertBank)
  }

  @Query(() => [BankType])
  async banksByUserId(
    @Arg('userId', () => ID) userId: string,
    @Ctx() ctx: Context
  ): Promise<BankType[]> {
    const banks = await ctx.prisma.bank.findMany({
      where: { userId }
    })
    return banks.map(convertBank)
  }

  @Query(() => BankType, { nullable: true })
  async bank(
    @Arg('id', () => ID) id: string,
    @Ctx() ctx: Context
  ): Promise<BankType | null> {
    const bank = await ctx.prisma.bank.findUnique({
      where: { id }
    })
    return bank ? convertBank(bank) : null
  }

  @Query(() => [BankAccountType])
  async bankAccounts(
    @Arg('bankId', () => ID) bankId: string,
    @Ctx() ctx: Context
  ): Promise<BankAccountType[]> {
    const accounts = await ctx.prisma.bankAccount.findMany({
      where: { bankId }
    })
    return accounts.map(convertBankAccount)
  }

  @Mutation(() => BankType)
  async createBank(
    @Arg('input', () => CreateBankInput) { name, userId }: CreateBankInput,
    @Ctx() ctx: Context
  ): Promise<BankType> {
    const bank = await ctx.prisma.bank.create({
      data: {
        name,
        userId
      }
    })
    return convertBank(bank)
  }

  @Mutation(() => BankAccountType)
  async createBankAccount(
    @Arg('input', () => CreateBankAccountInput) { bankId, accountId, type, balance, currencyCode }: CreateBankAccountInput,
    @Ctx() ctx: Context
  ): Promise<BankAccountType> {
    // Get the bank to get userId
    const bank = await ctx.prisma.bank.findUnique({
      where: { id: bankId }
    })
    
    if (!bank) {
      throw new Error('Bank not found')
    }

    const account = await ctx.prisma.bankAccount.create({
      data: {
        bankId,
        userId: bank.userId,
        accountId,
        type,
        balance,
        currencyCode
      }
    })
    return convertBankAccount(account)
  }

  @Mutation(() => BankType)
  async updateBank(
    @Arg('id', () => ID) id: string,
    @Arg('input', () => UpdateBankInput) input: UpdateBankInput,
    @Ctx() ctx: Context
  ): Promise<BankType> {
    const bank = await ctx.prisma.bank.update({
      where: { id },
      data: input
    })
    return convertBank(bank)
  }

  @Mutation(() => BankAccountType)
  async updateBankAccount(
    @Arg('id', () => ID) id: string,
    @Arg('input', () => UpdateBankAccountInput) input: UpdateBankAccountInput,
    @Ctx() ctx: Context
  ): Promise<BankAccountType> {
    const account = await ctx.prisma.bankAccount.update({
      where: { id },
      data: input
    })
    return convertBankAccount(account)
  }

  @Mutation(() => Boolean)
  async deleteBank(
    @Arg('id', () => ID) id: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    await ctx.prisma.bank.delete({
      where: { id }
    })
    return true
  }

  @Mutation(() => Boolean)
  async deleteBankAccount(
    @Arg('id', () => ID) id: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    await ctx.prisma.bankAccount.delete({
      where: { id }
    })
    return true
  }
}
