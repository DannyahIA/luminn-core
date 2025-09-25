import { InputType, ObjectType, Field } from 'type-graphql'

// ============ INPUT TYPES FOR IMPORTING DATA ============

@InputType()
export class ImportUserInput {
  @Field(() => String)
  external_id!: string

  @Field(() => String)
  name!: string

  @Field(() => String)
  email!: string

  @Field(() => String, { nullable: true })
  password_hash?: string

  @Field(() => Date, { nullable: true })
  created_at?: Date

  @Field(() => String, { nullable: true })
  metadata?: string // JSON string for additional metadata
}

@InputType()
export class ImportBankInput {
  @Field(() => String)
  external_id!: string

  @Field(() => String)
  user_external_id!: string

  @Field(() => String)
  name!: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => Boolean, { nullable: true })
  is_active?: boolean

  @Field(() => Date, { nullable: true })
  created_at?: Date

  @Field(() => String, { nullable: true })
  metadata?: string // JSON string for additional metadata
}

@InputType()
export class ImportTransactionInput {
  @Field(() => String)
  external_id!: string

  @Field(() => String)
  bank_external_id!: string

  @Field(() => Number)
  amount!: number

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  category?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => Date)
  transaction_date!: Date

  @Field(() => Date, { nullable: true })
  created_at?: Date

  @Field(() => String, { nullable: true })
  metadata?: string // JSON string for additional metadata
}

// ============ OUTPUT TYPES FOR IMPORT RESULTS ============

@ObjectType()
export class ImportResult {
  @Field(() => Boolean)
  success!: boolean

  @Field(() => String)
  message!: string

  @Field(() => String, { nullable: true })
  internal_id?: string

  @Field(() => String)
  external_id!: string
}

@ObjectType()
export class ImportBatchResult {
  @Field(() => Number)
  successful!: number

  @Field(() => Number)
  failed!: number

  @Field(() => Number)
  total!: number

  @Field(() => [ImportResult])
  results!: ImportResult[]
}

// ============ ERROR TYPES ============

@ObjectType()
export class ImportError {
  @Field(() => String)
  external_id!: string

  @Field(() => String)
  error_code!: string

  @Field(() => String)
  message!: string

  @Field(() => String, { nullable: true })
  details?: string
}

// ============ SYNC STATUS TYPES ============

@ObjectType()
export class SyncStatus {
  @Field(() => String)
  module!: string

  @Field(() => String)
  entity_type!: string

  @Field(() => Date)
  last_sync!: Date

  @Field(() => Number)
  total_records!: number

  @Field(() => Number)
  successful_imports!: number

  @Field(() => Number)
  failed_imports!: number

  @Field(() => [ImportError], { nullable: true })
  recent_errors?: ImportError[]
}

@ObjectType()
export class MappingStats {
  @Field(() => Number)
  total!: number

  @Field(() => Number)
  users!: number

  @Field(() => Number)
  banks!: number

  @Field(() => Number)
  transactions!: number

  @Field(() => Date, { nullable: true })
  last_import?: Date
}

// ============ EXPORT TYPES FOR SENDING DATA TO OTHER MODULES ============

@ObjectType()
export class ExportUser {
  @Field(() => String)
  external_id!: string

  @Field(() => String)
  name!: string

  @Field(() => String)
  email!: string

  @Field(() => Date)
  created_at!: Date

  @Field(() => Date)
  updated_at!: Date

  @Field(() => String, { nullable: true })
  metadata?: string
}

@ObjectType()
export class ExportBank {
  @Field(() => String)
  external_id!: string

  @Field(() => String)
  user_external_id!: string

  @Field(() => String)
  name!: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => Boolean)
  is_active!: boolean

  @Field(() => Date)
  created_at!: Date

  @Field(() => Date)
  updated_at!: Date

  @Field(() => String, { nullable: true })
  metadata?: string
}

@ObjectType()
export class ExportTransaction {
  @Field(() => String)
  external_id!: string

  @Field(() => String)
  bank_external_id!: string

  @Field(() => Number)
  amount!: number

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  category?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => Date)
  transaction_date!: Date

  @Field(() => Date)
  created_at!: Date

  @Field(() => Date)
  updated_at!: Date

  @Field(() => String, { nullable: true })
  metadata?: string
}
