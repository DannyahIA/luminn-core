import { Resolver, Mutation, Arg, Ctx, Query } from 'type-graphql'
import { PrismaClient } from '@prisma/client'
import { ImportUserInput, ImportBankInput, ImportTransactionInput, ImportResult, ImportBatchResult } from '../types/ImportTypes'
import { ExternalMappingService } from '../services/ExternalMappingService'
import { DuplicateDetectionService } from '../services/DuplicateDetectionService'

@Resolver()
export class ImportResolver {
  private prisma: PrismaClient
  private externalMappingService: ExternalMappingService
  private duplicateDetectionService: DuplicateDetectionService

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
    this.externalMappingService = new ExternalMappingService(prisma)
    this.duplicateDetectionService = new DuplicateDetectionService(prisma)
  }

  // ============ USER IMPORT ============

  @Mutation(() => ImportResult)
  async importUser(
    @Arg('data') data: ImportUserInput,
    @Ctx() ctx: any
  ): Promise<ImportResult> {
    try {
      // Check for duplicates
      const isDuplicate = await this.duplicateDetectionService.isUserDuplicate(
        data.email,
        data.external_id
      )

      if (isDuplicate) {
        return {
          success: false,
          message: `User with email ${data.email} or external_id ${data.external_id} already exists`,
          internal_id: null,
          external_id: data.external_id
        }
      }

      // Create user
      const user = await this.prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: data.password_hash || 'imported_user', // Default for imported users
          createdAt: data.created_at || new Date(),
          updatedAt: new Date()
        }
      })

      // Create external mapping
      await this.externalMappingService.createMapping(
        data.external_id,
        user.id,
        'user',
        'bank-hub',
        data.metadata
      )

      return {
        success: true,
        message: 'User imported successfully',
        internal_id: user.id,
        external_id: data.external_id
      }

    } catch (error) {
      console.log('Error importing user:', error)
      return {
        success: false,
        message: `Failed to import user: ${error}`,
        internal_id: null,
        external_id: data.external_id
      }
    }
  }

  @Mutation(() => ImportBatchResult)
  async importUsers(
    @Arg('users', () => [ImportUserInput]) users: ImportUserInput[],
    @Ctx() ctx: any
  ): Promise<ImportBatchResult> {
    const results: ImportResult[] = []
    let successful = 0
    let failed = 0

    // Batch duplicate detection
    const duplicates = await this.duplicateDetectionService.detectDuplicateUsers(
      users.map(u => ({ external_id: u.external_id, email: u.email }))
    )

    for (const userData of users) {
      if (duplicates.has(userData.external_id)) {
        results.push({
          success: false,
          message: `User with email ${userData.email} or external_id ${userData.external_id} already exists`,
          internal_id: null,
          external_id: userData.external_id
        })
        failed++
        continue
      }

      try {
        const user = await this.prisma.user.create({
          data: {
            name: userData.name,
            email: userData.email,
            password: userData.password_hash || 'imported_user',
            createdAt: userData.created_at || new Date(),
            updatedAt: new Date()
          }
        })

        await this.externalMappingService.createMapping(
          userData.external_id,
          user.id,
          'user',
          'bank-hub',
          userData.metadata
        )

        results.push({
          success: true,
          message: 'User imported successfully',
          internal_id: user.id,
          external_id: userData.external_id
        })
        successful++

      } catch (error) {
        results.push({
          success: false,
          message: `Failed to import user: ${error}`,
          internal_id: null,
          external_id: userData.external_id
        })
        failed++
      }
    }

    return {
      successful,
      failed,
      total: users.length,
      results
    }
  }

  // ============ BANK IMPORT ============

  @Mutation(() => ImportResult)
  async importBank(
    @Arg('data') data: ImportBankInput,
    @Ctx() ctx: any
  ): Promise<ImportResult> {
    try {
      // Get user internal ID
      const userMapping = await this.externalMappingService.getInternalId(
        data.user_external_id,
        'user',
        'bank-hub'
      )

      if (!userMapping) {
        return {
          success: false,
          message: `User with external_id ${data.user_external_id} not found`,
          internal_id: null,
          external_id: data.external_id
        }
      }

      // Check for duplicates
      const isDuplicate = await this.duplicateDetectionService.isBankDuplicate(
        data.external_id,
        data.user_external_id,
        data.name
      )

      if (isDuplicate) {
        return {
          success: false,
          message: `Bank ${data.name} already exists for this user`,
          internal_id: null,
          external_id: data.external_id
        }
      }

      // Create bank
      const bank = await this.prisma.bank.create({
        data: {
          name: data.name,
          type: data.type,
          userId: userMapping,
          isActive: data.is_active ?? true,
          createdAt: data.created_at || new Date(),
          updatedAt: new Date()
        }
      })

      // Create external mapping
      await this.externalMappingService.createMapping(
        data.external_id,
        bank.id,
        'bank',
        'bank-hub',
        data.metadata
      )

      return {
        success: true,
        message: 'Bank imported successfully',
        internal_id: bank.id,
        external_id: data.external_id
      }

    } catch (error) {
      console.log('Error importing bank:', error)
      return {
        success: false,
        message: `Failed to import bank: ${error}`,
        internal_id: null,
        external_id: data.external_id
      }
    }
  }

  // ============ TRANSACTION IMPORT ============

  @Mutation(() => ImportResult)
  async importTransaction(
    @Arg('data') data: ImportTransactionInput,
    @Ctx() ctx: any
  ): Promise<ImportResult> {
    try {
      // Get bank internal ID
      const bankMapping = await this.externalMappingService.getInternalId(
        data.bank_external_id,
        'bank',
        'bank-hub'
      )

      if (!bankMapping) {
        return {
          success: false,
          message: `Bank with external_id ${data.bank_external_id} not found`,
          internal_id: null,
          external_id: data.external_id
        }
      }

      // Check for duplicates
      const isDuplicate = await this.duplicateDetectionService.isTransactionDuplicate(
        data.external_id,
        data.amount,
        data.transaction_date,
        bankMapping
      )

      if (isDuplicate) {
        return {
          success: false,
          message: `Transaction already exists`,
          internal_id: null,
          external_id: data.external_id
        }
      }

      // Create transaction
      const transaction = await this.prisma.transaction.create({
        data: {
          amount: data.amount,
          description: data.description,
          category: data.category,
          type: data.type,
          transactionDate: data.transaction_date,
          bankId: bankMapping,
          createdAt: data.created_at || new Date(),
          updatedAt: new Date()
        }
      })

      // Create external mapping
      await this.externalMappingService.createMapping(
        data.external_id,
        transaction.id,
        'transaction',
        'bank-hub',
        data.metadata
      )

      return {
        success: true,
        message: 'Transaction imported successfully',
        internal_id: transaction.id,
        external_id: data.external_id
      }

    } catch (error) {
      console.log('Error importing transaction:', error)
      return {
        success: false,
        message: `Failed to import transaction: ${error}`,
        internal_id: null,
        external_id: data.external_id
      }
    }
  }

  @Mutation(() => ImportBatchResult)
  async importTransactions(
    @Arg('transactions', () => [ImportTransactionInput]) transactions: ImportTransactionInput[],
    @Ctx() ctx: any
  ): Promise<ImportBatchResult> {
    const results: ImportResult[] = []
    let successful = 0
    let failed = 0

    // Get all bank mappings needed
    const bank_external_ids = [...new Set(transactions.map(t => t.bank_external_id))]
    const bankMappings = await this.externalMappingService.getBatchInternalIds(
      bank_external_ids,
      'bank',
      'bank-hub'
    )

    // Check for duplicates in batch
    const duplicates = await this.duplicateDetectionService.checkTransactionDuplicates(
      transactions.map(t => ({
        external_id: t.external_id,
        amount: t.amount,
        transaction_date: t.transaction_date,
        bank_external_id: t.bank_external_id
      })),
      bankMappings
    )

    for (const transactionData of transactions) {
      const bankId = bankMappings.get(transactionData.bank_external_id)
      
      if (!bankId) {
        results.push({
          success: false,
          message: `Bank with external_id ${transactionData.bank_external_id} not found`,
          internal_id: null,
          external_id: transactionData.external_id
        })
        failed++
        continue
      }

      if (duplicates.has(transactionData.external_id)) {
        results.push({
          success: false,
          message: `Transaction already exists`,
          internal_id: null,
          external_id: transactionData.external_id
        })
        failed++
        continue
      }

      try {
        const transaction = await this.prisma.transaction.create({
          data: {
            amount: transactionData.amount,
            description: transactionData.description,
            category: transactionData.category,
            type: transactionData.type,
            transactionDate: transactionData.transaction_date,
            bankId: bankId,
            createdAt: transactionData.created_at || new Date(),
            updatedAt: new Date()
          }
        })

        await this.externalMappingService.createMapping(
          transactionData.external_id,
          transaction.id,
          'transaction',
          'bank-hub',
          transactionData.metadata
        )

        results.push({
          success: true,
          message: 'Transaction imported successfully',
          internal_id: transaction.id,
          external_id: transactionData.external_id
        })
        successful++

      } catch (error) {
        results.push({
          success: false,
          message: `Failed to import transaction: ${error}`,
          internal_id: null,
          external_id: transactionData.external_id
        })
        failed++
      }
    }

    return {
      successful,
      failed,
      total: transactions.length,
      results
    }
  }

  // ============ UTILITY QUERIES ============

  @Query(() => String)
  async getImportHealth(): Promise<string> {
    try {
      const userCount = await this.prisma.user.count()
      const bankCount = await this.prisma.bank.count()
      const transactionCount = await this.prisma.transaction.count()
      const mappingCount = await this.prisma.externalMapping.count({
        where: { module: 'bank-hub' }
      })

      return `Import service healthy. Users: ${userCount}, Banks: ${bankCount}, Transactions: ${transactionCount}, Mappings: ${mappingCount}`
    } catch (error) {
      return `Import service unhealthy: ${error}`
    }
  }

  @Query(() => [String])
  async getExternalIds(
    @Arg('entity_type') entity_type: string,
    @Arg('module', { defaultValue: 'bank-hub' }) module: string
  ): Promise<string[]> {
    const mappings = await this.prisma.externalMapping.findMany({
      where: {
        entity_type,
        module
      },
      select: {
        external_id: true
      },
      take: 100 // Limit for performance
    })

    return mappings.map((m: any) => m.external_id)
  }
}
