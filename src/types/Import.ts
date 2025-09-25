import { Field, ObjectType, InputType, Int } from 'type-graphql'

// ============ INPUT TYPES ============

@InputType()
export class ImportUserInput {
  @Field(() => String)
  external_id: string

  @Field(() => String)
  name: string

  @Field(() => String)
  email: string

  @Field(() => String, { nullable: true })
  phone_number?: string

  @Field(() => Date)
  created_at: Date

  @Field(() => Date)
  updated_at: Date
}

@InputType()
export class ImportUsersInput {
  @Field(() => [ImportUserInput])
  users: ImportUserInput[]

  @Field(() => ImportMetadataInput)
  metadata: ImportMetadataInput
}

@InputType()
export class ImportBankInput {
  @Field(() => String)
  external_id: string

  @Field(() => String)
  user_external_id: string

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  institution_code?: string

  @Field(() => Date)
  created_at: Date

  @Field(() => Date)
  updated_at: Date
}

@InputType()
export class ImportBanksInput {
  @Field(() => [ImportBankInput])
  banks: ImportBankInput[]

  @Field(() => ImportMetadataInput)
  metadata: ImportMetadataInput
}

@InputType()
export class ImportTransactionInput {
  @Field(() => String)
  external_id: string

  @Field(() => String)
  bank_external_id: string

  @Field(() => String, { nullable: true })
  account_external_id?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => Number)
  amount: number

  @Field(() => String, { nullable: true })
  currency?: string

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => Date, { nullable: true })
  transaction_date?: Date

  @Field(() => String, { nullable: true })
  category?: string

  @Field(() => Date)
  created_at: Date

  @Field(() => Date)
  updated_at: Date
}

@InputType()
export class ImportTransactionsInput {
  @Field(() => [ImportTransactionInput])
  transactions: ImportTransactionInput[]

  @Field(() => ImportMetadataInput)
  metadata: ImportMetadataInput
}

@InputType()
export class ImportMetadataInput {
  @Field(() => Int)
  total_count: number

  @Field(() => Date)
  export_timestamp: Date

  @Field(() => String, { nullable: true })
  module_version?: string
}

// ============ RESPONSE TYPES ============

@ObjectType()
export class ImportError {
  @Field(() => String)
  external_id: string

  @Field(() => String)
  message: string

  @Field(() => String, { nullable: true })
  field?: string
}

@ObjectType()
export class ImportUsersResponse {
  @Field(() => Boolean)
  success: boolean

  @Field(() => Int)
  imported_count: number

  @Field(() => Int)
  updated_count: number

  @Field(() => Int)
  skipped_count: number

  @Field(() => [ImportError])
  errors: ImportError[]

  @Field(() => String, { nullable: true })
  message?: string
}

@ObjectType()
export class ImportBanksResponse {
  @Field(() => Boolean)
  success: boolean

  @Field(() => Int)
  imported_count: number

  @Field(() => Int)
  updated_count: number

  @Field(() => Int)
  skipped_count: number

  @Field(() => [ImportError])
  errors: ImportError[]

  @Field(() => String, { nullable: true })
  message?: string
}

@ObjectType()
export class ImportTransactionsResponse {
  @Field(() => Boolean)
  success: boolean

  @Field(() => Int)
  imported_count: number

  @Field(() => Int)
  duplicates_skipped: number

  @Field(() => Int)
  errors_count: number

  @Field(() => [ImportError])
  errors: ImportError[]

  @Field(() => String, { nullable: true })
  message?: string
}

// ============ SYNC STATUS TYPES ============

@ObjectType()
export class RecordsCount {
  @Field(() => Int)
  users: number

  @Field(() => Int)
  banks: number

  @Field(() => Int)
  accounts: number

  @Field(() => Int)
  transactions: number
}

@ObjectType()
export class SyncStatus {
  @Field(() => Date, { nullable: true })
  last_sync_timestamp?: Date

  @Field(() => Date, { nullable: true })
  next_sync_timestamp?: Date

  @Field(() => String)
  status: string // 'idle', 'syncing', 'error'

  @Field(() => RecordsCount)
  records_count: RecordsCount

  @Field(() => String, { nullable: true })
  last_error?: string
}
