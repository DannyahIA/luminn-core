export class DuplicateDetectionService {
  private prisma: any

  constructor(prisma: any) {
    this.prisma = prisma
  }

  // ============ TRANSACTION DUPLICATE DETECTION ============

  async isTransactionDuplicate(
    external_id: string,
    amount: number,
    transaction_date: Date,
    bank_id: string
  ): Promise<boolean> {
    // Check by external_id first (most reliable)
    const existingByExternalId = await this.prisma.externalMapping.findUnique({
      where: {
        external_id_module: {
          externalId: external_id,
          module: 'bank-hub',
          entityType: 'transaction'
        }
      }
    })

    if (existingByExternalId) {
      return true
    }

    // Check by transaction characteristics (fallback)
    const similarTransactions = await this.prisma.transaction.findMany({
      where: {
        bankId: bank_id,
        amount: amount,
        transactionDate: {
          gte: new Date(transaction_date.getTime() - 24 * 60 * 60 * 1000), // 24h before
          lte: new Date(transaction_date.getTime() + 24 * 60 * 60 * 1000)  // 24h after
        }
      },
      take: 5 // Limit to avoid performance issues
    })

    // If we find transactions with same amount and similar date on same bank
    return similarTransactions.length > 0
  }

  async checkTransactionDuplicates(
    transactions: Array<{
      external_id: string
      amount: number
      transaction_date: Date
      bank_external_id: string
    }>,
    bankMappings: Map<string, string>
  ): Promise<Set<string>> {
    const duplicates = new Set<string>()
    
    // Get all external IDs to check mappings in batch
    const external_ids = transactions.map(t => t.external_id)
    const existingMappings = await this.prisma.externalMapping.findMany({
      where: {
        externalId: { in: external_ids },
        module: 'bank-hub',
        entityType: 'transaction'
      }
    })

    // Mark all with existing mappings as duplicates
    existingMappings.forEach((mapping: any) => {
      duplicates.add(mapping.externalId)
    })

    // Check remaining transactions for characteristic-based duplicates
    const remainingTransactions = transactions.filter(t => !duplicates.has(t.external_id))
    
    for (const transaction of remainingTransactions) {
      const internal_bank_id = bankMappings.get(transaction.bank_external_id)
      if (!internal_bank_id) continue

      const isDuplicate = await this.isTransactionDuplicate(
        transaction.external_id,
        transaction.amount,
        transaction.transaction_date,
        internal_bank_id
      )

      if (isDuplicate) {
        duplicates.add(transaction.external_id)
      }
    }

    return duplicates
  }

  // ============ USER DUPLICATE DETECTION ============

  async isUserDuplicate(email: string, external_id: string): Promise<boolean> {
    // Check by external mapping
    const existingMapping = await this.prisma.externalMapping.findUnique({
      where: {
        external_id_module: {
          externalId: external_id,
          module: 'bank-hub',
          entityType: 'user'
        }
      }
    })

    if (existingMapping) {
      return true
    }

    // Check by email (users should have unique emails)
    const existingUser = await this.prisma.user.findUnique({
      where: { email }
    })

    return !!existingUser
  }

  // ============ BANK DUPLICATE DETECTION ============

  async isBankDuplicate(
    external_id: string,
    user_external_id: string,
    name: string
  ): Promise<boolean> {
    // Check by external mapping
    const existingMapping = await this.prisma.externalMapping.findUnique({
      where: {
        external_id_module: {
          externalId: external_id,
          module: 'bank-hub',
          entityType: 'bank'
        }
      }
    })

    if (existingMapping) {
      return true
    }

    // Get user internal ID
    const userMapping = await this.prisma.externalMapping.findUnique({
      where: {
        external_id_module: {
          externalId: user_external_id,
          module: 'bank-hub',
          entityType: 'user'
        }
      }
    })

    if (!userMapping) {
      return false // User doesn't exist, so bank can't be duplicate
    }

    // Check by user + name combination
    const existingBank = await this.prisma.bank.findFirst({
      where: {
        userId: userMapping.internalId,
        name: name
      }
    })

    return !!existingBank
  }

  // ============ BATCH DUPLICATE DETECTION ============

  async detectDuplicateUsers(
    users: Array<{ external_id: string; email: string }>
  ): Promise<Set<string>> {
    const duplicates = new Set<string>()
    
    // Check external mappings in batch
    const external_ids = users.map(u => u.external_id)
    const existingMappings = await this.prisma.externalMapping.findMany({
      where: {
        externalId: { in: external_ids },
        module: 'bank-hub',
        entityType: 'user'
      }
    })

    existingMappings.forEach((mapping: any) => {
      duplicates.add(mapping.externalId)
    })

    // Check emails in batch for remaining users
    const remainingUsers = users.filter(u => !duplicates.has(u.external_id))
    const emails = remainingUsers.map(u => u.email)
    
    if (emails.length > 0) {
      const existingUsers = await this.prisma.user.findMany({
        where: {
          email: { in: emails }
        },
        select: { email: true }
      })

      const existingEmails = new Set(existingUsers.map((u: any) => u.email))
      
      remainingUsers.forEach(user => {
        if (existingEmails.has(user.email)) {
          duplicates.add(user.external_id)
        }
      })
    }

    return duplicates
  }

  // ============ CLEANUP UTILITIES ============

  async findOrphanedMappings(): Promise<Array<{
    external_id: string
    entity_type: string
    internal_id: string
  }>> {
    // Find mappings where the internal entity no longer exists
    const orphanedMappings: Array<{
      external_id: string
      entity_type: string
      internal_id: string
    }> = []

    // Check user mappings
    const userMappings = await this.prisma.externalMapping.findMany({
      where: { entityType: 'user', module: 'bank-hub' },
      include: {
        user: true
      }
    })

    userMappings.forEach((mapping: any) => {
      if (!mapping.user) {
        orphanedMappings.push({
          external_id: mapping.externalId,
          entity_type: mapping.entityType,
          internal_id: mapping.internalId
        })
      }
    })

    return orphanedMappings
  }

  async cleanupOrphanedMappings(): Promise<number> {
    const orphaned = await this.findOrphanedMappings()
    
    if (orphaned.length === 0) {
      return 0
    }

    const external_ids = orphaned.map(o => o.external_id)
    
    const result = await this.prisma.externalMapping.deleteMany({
      where: {
        externalId: { in: external_ids },
        module: 'bank-hub'
      }
    })

    return result.count
  }
}
