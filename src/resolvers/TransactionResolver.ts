import { Resolver, Query, Mutation, Arg, Ctx, ID } from 'type-graphql'
import { TransactionType, CreateTransactionInput, UpdateTransactionInput } from '../types'
import { Context } from '../types/context'
import { convertTransaction } from '../utils/converters'

@Resolver()
export class TransactionResolver {
  @Query(() => [TransactionType])
  async transactions(@Ctx() ctx: Context): Promise<TransactionType[]> {
    const transactions = await ctx.prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return transactions.map(convertTransaction)
  }

  @Query(() => [TransactionType])
  async transactionsByBankId(
    @Arg('bankId', () => ID) bankId: string,
    @Ctx() ctx: Context
  ): Promise<TransactionType[]> {
    const transactions = await ctx.prisma.transaction.findMany({
      where: { bankId },
      orderBy: { createdAt: 'desc' }
    })
    return transactions.map(convertTransaction)
  }

  @Query(() => [TransactionType])
  async transactionsByUserId(
    @Arg('userId', () => ID) userId: string,
    @Ctx() ctx: Context
  ): Promise<TransactionType[]> {
    const transactions = await ctx.prisma.transaction.findMany({
      where: {
        bank: {
          userId
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return transactions.map(convertTransaction)
  }

  @Query(() => [TransactionType])
  async transactionsByDateRange(
    @Arg('startDate', () => Date) startDate: Date,
    @Arg('endDate', () => Date) endDate: Date,
    @Ctx() ctx: Context
  ): Promise<TransactionType[]> {
    const transactions = await ctx.prisma.transaction.findMany({
      where: {
        transactionDate: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return transactions.map(convertTransaction)
  }

  @Query(() => TransactionType, { nullable: true })
  async transaction(
    @Arg('id', () => ID) id: string,
    @Ctx() ctx: Context
  ): Promise<TransactionType | null> {
    const transaction = await ctx.prisma.transaction.findUnique({
      where: { id }
    })
    return transaction ? convertTransaction(transaction) : null
  }

  @Mutation(() => TransactionType)
  async createTransaction(
    @Arg('input', () => CreateTransactionInput) { bankId, type, amount, currency, description, transactionDate }: CreateTransactionInput,
    @Ctx() ctx: Context
  ): Promise<TransactionType> {
    const transaction = await ctx.prisma.transaction.create({
      data: {
        bankId,
        type,
        amount,
        currency,
        description,
        transactionDate
      }
    })
    return convertTransaction(transaction)
  }

  @Mutation(() => TransactionType)
  async updateTransaction(
    @Arg('id', () => ID) id: string,
    @Arg('input', () => UpdateTransactionInput) input: UpdateTransactionInput,
    @Ctx() ctx: Context
  ): Promise<TransactionType> {
    const transaction = await ctx.prisma.transaction.update({
      where: { id },
      data: input
    })
    return convertTransaction(transaction)
  }

  @Mutation(() => Boolean)
  async deleteTransaction(
    @Arg('id', () => ID) id: string,
    @Ctx() ctx: Context
  ): Promise<boolean> {
    await ctx.prisma.transaction.delete({
      where: { id }
    })
    return true
  }
}
