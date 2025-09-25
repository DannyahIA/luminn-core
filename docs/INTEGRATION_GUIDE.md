# 📋 Integration Guide - Automation Hub Core

## 🎯 Overview

Este documento define como os módulos `bank-hub` e `website-hub` devem integrar-se com o `automation-hub-core` para formar um ecossistema completo de automação bancária.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   website-hub   │    │ automation-hub  │    │   bank-hub      │
│   (Frontend)    │◄──►│    (Core)       │◄──►│   (Banking)     │
│                 │    │                 │    │                 │
│ Next.js + React│    │ Node.js/GraphQL │    │ Python + SQLite │
│ TypeScript      │    │ PostgreSQL      │    │ Banking APIs    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow
1. **bank-hub** → Busca dados bancários de APIs externas (Pluggy, Open Banking)
2. **bank-hub** → Envia dados para **automation-hub-core** via REST/GraphQL
3. **automation-hub-core** → Persiste dados no PostgreSQL
4. **website-hub** → Consulta dados via GraphQL do **automation-hub-core**

## 🔄 Integration Patterns

### 1. Data Synchronization Pattern
- **Frequency**: Configurável (padrão: a cada 6 horas)
- **Method**: Push from bank-hub to automation-hub-core
- **Error Handling**: Retry with exponential backoff
- **Deduplication**: Based on transaction IDs and timestamps

### 2. API Communication Pattern
- **Primary**: GraphQL for complex queries
- **Secondary**: REST for simple operations
- **Authentication**: JWT tokens
- **Rate Limiting**: 1000 requests/hour per module

## 📡 Bank-Hub Integration

### 📤 Data Export Endpoints (bank-hub should implement)

#### 1. Users Export
```python
# POST /api/v1/export/users
# Send all users to automation-hub-core
{
  "users": [
    {
      "external_id": "user_123",
      "name": "João Silva",
      "email": "joao@example.com",
      "phone_number": "+5511999999999",
      "created_at": "2024-09-10T10:00:00Z",
      "updated_at": "2024-09-10T15:30:00Z"
    }
  ],
  "metadata": {
    "total_count": 1,
    "export_timestamp": "2024-09-10T15:30:00Z",
    "module_version": "1.0.0"
  }
}
```

#### 2. Banks Export
```python
# POST /api/v1/export/banks
{
  "banks": [
    {
      "external_id": "bank_456",
      "user_external_id": "user_123",
      "name": "Banco do Brasil",
      "institution_code": "001",
      "created_at": "2024-09-10T10:00:00Z",
      "updated_at": "2024-09-10T15:30:00Z"
    }
  ],
  "metadata": {
    "total_count": 1,
    "export_timestamp": "2024-09-10T15:30:00Z"
  }
}
```

#### 3. Bank Accounts Export
```python
# POST /api/v1/export/accounts
{
  "accounts": [
    {
      "external_id": "account_789",
      "bank_external_id": "bank_456",
      "user_external_id": "user_123",
      "account_id": "12345-6",
      "type": "CONTA_CORRENTE",
      "balance": 2500.75,
      "currency_code": "BRL",
      "created_at": "2024-09-10T10:00:00Z",
      "updated_at": "2024-09-10T15:30:00Z"
    }
  ]
}
```

#### 4. Transactions Export
```python
# POST /api/v1/export/transactions
{
  "transactions": [
    {
      "external_id": "tx_101112",
      "bank_external_id": "bank_456",
      "account_external_id": "account_789",
      "type": "PIX",
      "amount": -150.50,
      "currency": "BRL",
      "description": "Pagamento PIX - João Silva",
      "transaction_date": "2024-09-10T14:30:00Z",
      "category": "TRANSFERENCIA",
      "created_at": "2024-09-10T15:00:00Z",
      "updated_at": "2024-09-10T15:00:00Z"
    }
  ],
  "metadata": {
    "total_count": 1,
    "date_range": {
      "start": "2024-09-01T00:00:00Z",
      "end": "2024-09-10T23:59:59Z"
    }
  }
}
```

### 🔄 Bank-Hub Implementation Requirements

#### Core Components Needed:

1. **Export Service** (`src/services/export_service.py`):
```python
class ExportService:
    def __init__(self, automation_hub_client):
        self.client = automation_hub_client
    
    async def export_all_data(self):
        """Export all data to automation-hub-core"""
        await self.export_users()
        await self.export_banks()
        await self.export_accounts()
        await self.export_transactions()
    
    async def export_transactions(self, date_range=None):
        """Export transactions for specified date range"""
        pass
```

2. **Automation Hub Client** (`src/clients/automation_hub_client.py`):
```python
class AutomationHubClient:
    def __init__(self, base_url, api_key):
        self.base_url = base_url
        self.api_key = api_key
        self.session = aiohttp.ClientSession()
    
    async def send_users(self, users_data):
        """Send users to automation-hub-core"""
        pass
    
    async def send_transactions(self, transactions_data):
        """Send transactions to automation-hub-core"""
        pass
```

3. **Scheduler** (`src/scheduler/sync_scheduler.py`):
```python
# Schedule periodic syncs
import schedule
import time

def run_sync():
    export_service.export_all_data()

# Run every 6 hours
schedule.every(6).hours.do(run_sync)

# Run daily at 3 AM for full sync
schedule.every().day.at("03:00").do(lambda: export_service.export_all_data(full_sync=True))
```

## 📨 Automation-Hub-Core Integration

### 📥 Data Import Endpoints (automation-hub-core implements)

#### 1. Import Users
```typescript
// POST /api/v1/import/users
// GraphQL Mutation
mutation ImportUsers($input: ImportUsersInput!) {
  importUsers(input: $input) {
    success
    imported_count
    errors {
      external_id
      message
    }
  }
}
```

#### 2. Import Transactions
```typescript
// POST /api/v1/import/transactions
mutation ImportTransactions($input: ImportTransactionsInput!) {
  importTransactions(input: $input) {
    success
    imported_count
    duplicates_skipped
    errors {
      external_id
      message
    }
  }
}
```

#### 3. Sync Status
```typescript
// GET /api/v1/sync/status
query SyncStatus {
  syncStatus {
    last_sync_timestamp
    next_sync_timestamp
    status
    records_count {
      users
      banks
      accounts
      transactions
    }
  }
}
```

### 🔧 Core Implementation Requirements

#### 1. Import Resolvers (`src/resolvers/ImportResolver.ts`):
```typescript
@Resolver()
export class ImportResolver {
  @Mutation(() => ImportUsersResponse)
  async importUsers(
    @Arg('input') input: ImportUsersInput,
    @Ctx() ctx: Context
  ): Promise<ImportUsersResponse> {
    // 1. Validate data
    // 2. Transform external_id to internal mapping
    // 3. Upsert users (create or update)
    // 4. Return summary
  }

  @Mutation(() => ImportTransactionsResponse)
  async importTransactions(
    @Arg('input') input: ImportTransactionsInput,
    @Ctx() ctx: Context
  ): Promise<ImportTransactionsResponse> {
    // 1. Validate transactions
    // 2. Check for duplicates
    // 3. Link to existing banks/accounts
    // 4. Batch insert
    // 5. Return summary
  }
}
```

#### 2. External ID Mapping (`src/services/ExternalMappingService.ts`):
```typescript
export class ExternalMappingService {
  async mapExternalUser(external_id: string): Promise<string> {
    // Map bank-hub user ID to automation-hub user ID
  }

  async mapExternalBank(external_id: string, user_id: string): Promise<string> {
    // Map bank-hub bank ID to automation-hub bank ID
  }

  async createUserMapping(external_id: string, internal_id: string): Promise<void> {
    // Store mapping for future reference
  }
}
```

#### 3. Duplicate Detection (`src/services/DuplicateDetectionService.ts`):
```typescript
export class DuplicateDetectionService {
  async isTransactionDuplicate(
    external_id: string,
    amount: number,
    date: Date,
    bank_id: string
  ): Promise<boolean> {
    // Check if transaction already exists
    // Use combination of external_id, amount, date, bank_id
  }
}
```

## 🌐 Website-Hub Integration

### 📊 Data Consumption (website-hub implementation)

#### 1. GraphQL Queries for Frontend
```typescript
// Get user's financial overview
const GET_FINANCIAL_OVERVIEW = gql`
  query GetFinancialOverview($userId: ID!) {
    user(id: $userId) {
      id
      name
      banks {
        id
        name
        accounts {
          id
          type
          balance
          currency_code
        }
      }
    }
    
    transactionsByUserId(userId: $userId, limit: 10) {
      id
      type
      amount
      description
      transaction_date
      bank {
        name
      }
    }
  }
`;
```

#### 2. Real-time Updates (GraphQL Subscriptions)
```typescript
// Subscribe to new transactions
const TRANSACTION_SUBSCRIPTION = gql`
  subscription OnNewTransaction($userId: ID!) {
    transactionAdded(userId: $userId) {
      id
      type
      amount
      description
      transaction_date
    }
  }
`;
```

#### 3. Financial Analytics Queries
```typescript
const GET_SPENDING_ANALYSIS = gql`
  query GetSpendingAnalysis($userId: ID!, $dateRange: DateRangeInput!) {
    spendingByCategory(userId: $userId, dateRange: $dateRange) {
      category
      total_amount
      transaction_count
    }
    
    monthlySpending(userId: $userId, months: 12) {
      month
      total_spent
      total_income
    }
  }
`;
```

## 🔐 Authentication & Authorization

### JWT Token Structure
```json
{
  "sub": "user_id",
  "iss": "automation-hub-core",
  "aud": ["website-hub", "bank-hub"],
  "exp": 1694357200,
  "iat": 1694353600,
  "scope": ["read:transactions", "write:users", "sync:data"]
}
```

### API Key Management
- **bank-hub**: Requires `sync:data` scope
- **website-hub**: Requires `read:*` scopes
- **Admin operations**: Require `admin:*` scope

## 📅 Sync Schedule Configuration

### Environment Variables
```env
# Bank-Hub Configuration
BANK_HUB_SYNC_INTERVAL_HOURS=6
BANK_HUB_FULL_SYNC_TIME="03:00"
BANK_HUB_MAX_RETRIES=3
BANK_HUB_TIMEOUT_SECONDS=30

# Automation-Hub Configuration
AUTOMATION_HUB_API_URL="http://localhost:4000/graphql"
AUTOMATION_HUB_API_KEY="your-api-key"
AUTOMATION_HUB_BATCH_SIZE=100
```

### Sync Frequency Options
- **Real-time**: WebSockets for critical transactions
- **Frequent**: Every 15 minutes for account balances
- **Regular**: Every 6 hours for transactions
- **Daily**: Full sync at 3 AM for data integrity

## 🚨 Error Handling & Monitoring

### Error Types & Recovery
```typescript
enum SyncErrorType {
  NETWORK_ERROR = "NETWORK_ERROR",
  AUTHENTICATION_ERROR = "AUTH_ERROR", 
  VALIDATION_ERROR = "VALIDATION_ERROR",
  DUPLICATE_ERROR = "DUPLICATE_ERROR",
  RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR"
}
```

### Monitoring Endpoints
```typescript
// Health check for integrations
GET /api/v1/health/integrations
{
  "bank_hub": {
    "status": "healthy",
    "last_sync": "2024-09-10T15:30:00Z",
    "next_sync": "2024-09-10T21:30:00Z"
  },
  "website_hub": {
    "status": "healthy",
    "active_sessions": 5,
    "avg_response_time": "120ms"
  }
}
```

## 📋 Implementation Checklist

### Bank-Hub Tasks
- [ ] Implement ExportService
- [ ] Create AutomationHubClient
- [ ] Add sync scheduler
- [ ] Implement error handling
- [ ] Add logging and monitoring
- [ ] Create configuration management

### Automation-Hub-Core Tasks
- [ ] Create ImportResolver
- [ ] Implement ExternalMappingService
- [ ] Add DuplicateDetectionService
- [ ] Create sync status tracking
- [ ] Implement rate limiting
- [ ] Add monitoring endpoints

### Website-Hub Tasks
- [ ] Create GraphQL client
- [ ] Implement data fetching hooks
- [ ] Add real-time subscriptions
- [ ] Create financial analytics components
- [ ] Implement error boundaries
- [ ] Add loading states

## 🧪 Testing Strategy

### Integration Tests
```typescript
describe('Bank-Hub Integration', () => {
  test('should import users successfully', async () => {
    // Test user import flow
  });
  
  test('should handle duplicate transactions', async () => {
    // Test duplicate detection
  });
  
  test('should sync data on schedule', async () => {
    // Test scheduled sync
  });
});
```

### End-to-End Tests
- Full data flow from bank-hub → automation-hub → website-hub
- Error scenarios and recovery
- Performance under load

---

## 🚀 Getting Started

1. **Set up authentication** between modules
2. **Implement bank-hub export service** 
3. **Create automation-hub import endpoints**
4. **Test data flow** with sample data
5. **Configure sync schedules**
6. **Add monitoring and alerting**
7. **Integrate website-hub** for data consumption

This integration guide ensures seamless data flow and communication between all three modules of the Automation Hub ecosystem.
