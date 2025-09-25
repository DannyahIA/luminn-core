import { User, Bank, BankAccount, Transaction } from '@prisma/client'
import { UserType, BankType, BankAccountType, TransactionType } from '../types'

export const convertUser = (user: User): UserType => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phoneNumber: user.phoneNumber,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
})

export const convertBank = (bank: Bank): BankType => ({
  id: bank.id,
  name: bank.name,
  createdAt: bank.createdAt,
  updatedAt: bank.updatedAt,
  userId: bank.userId,
})

export const convertBankAccount = (account: BankAccount): BankAccountType => ({
  id: account.id,
  createdAt: account.createdAt,
  updatedAt: account.updatedAt,
  userId: account.userId,
  bankId: account.bankId,
  accountId: account.accountId,
  type: account.type,
  balance: account.balance,
  currencyCode: account.currencyCode,
})

export const convertTransaction = (transaction: Transaction): TransactionType => ({
  id: transaction.id,
  createdAt: transaction.createdAt,
  updatedAt: transaction.updatedAt,
  bankId: transaction.bankId,
  type: transaction.type,
  amount: transaction.amount,
  currency: transaction.currency,
  description: transaction.description,
  transactionDate: transaction.transactionDate,
})
