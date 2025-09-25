# 🔄 Guia de Alterações - Bank-Hub Integration

## 📋 Overview

Este documento define todas as alterações necessárias no módulo `bank-hub` para integrar corretamente com o `automation-hub-core`. O bank-hub será responsável por buscar dados bancários e enviá-los para o automation-hub-core via GraphQL.

---

## 🏗️ Arquitetura Atual vs Nova

### ❌ Antes (Standalone)
```
bank-hub (Python + SQLite) 
    ↓
Dados ficam locais no SQLite
```

### ✅ Depois (Integrado)
```
bank-hub (Python + SQLite Local Cache) 
    ↓ GraphQL Mutations
automation-hub-core (Node.js + PostgreSQL)
    ↓ GraphQL Queries  
website-hub (Next.js)
```

---

## 📦 Dependências a Adicionar

### 1. requirements.txt
```txt
# Adicionar estas dependências:
aiohttp>=3.8.0
asyncio
schedule>=1.2.0
pydantic>=2.0.0
```

### 2. Instalar dependências
```bash
pip install aiohttp schedule pydantic
```

---

## 🆕 Novos Arquivos a Criar

### 1. `src/clients/automation_hub_client.py`
```python
import aiohttp
import asyncio
from typing import List, Dict, Any, Optional
import json
from datetime import datetime

class AutomationHubClient:
    def __init__(self, base_url: str = "http://localhost:4000"):
        self.base_url = base_url
        self.graphql_url = f"{base_url}/graphql"
        self.session = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def execute_mutation(self, mutation: str, variables: Dict = None) -> Dict:
        """Execute GraphQL mutation"""
        payload = {
            "query": mutation,
            "variables": variables or {}
        }
        
        async with self.session.post(
            self.graphql_url,
            json=payload,
            headers={"Content-Type": "application/json"}
        ) as response:
            result = await response.json()
            if response.status != 200:
                raise Exception(f"GraphQL Error: {result}")
            return result
    
    async def import_user(self, user_data: Dict) -> Dict:
        """Import user to automation-hub-core"""
        mutation = """
        mutation ImportUser($data: ImportUserInput!) {
            importUser(data: $data) {
                success
                message
                internal_id
                external_id
            }
        }
        """
        return await self.execute_mutation(mutation, {"data": user_data})
    
    async def import_bank(self, bank_data: Dict) -> Dict:
        """Import bank to automation-hub-core"""
        mutation = """
        mutation ImportBank($data: ImportBankInput!) {
            importBank(data: $data) {
                success
                message
                internal_id
                external_id
            }
        }
        """
        return await self.execute_mutation(mutation, {"data": bank_data})
    
    async def import_transactions_batch(self, transactions: List[Dict]) -> Dict:
        """Import multiple transactions in batch"""
        mutation = """
        mutation ImportTransactions($transactions: [ImportTransactionInput!]!) {
            importTransactions(transactions: $transactions) {
                successful
                failed
                total
                results {
                    success
                    message
                    external_id
                }
            }
        }
        """
        return await self.execute_mutation(mutation, {"transactions": transactions})
```

### 2. `src/services/export_service.py`
```python
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from src.clients.automation_hub_client import AutomationHubClient
from src.infrastructure.repositories import UserRepository, BankRepository, TransactionRepository
import logging

logger = logging.getLogger(__name__)

class ExportService:
    def __init__(self):
        self.automation_hub_client = AutomationHubClient()
        self.user_repo = UserRepository()
        self.bank_repo = BankRepository()
        self.transaction_repo = TransactionRepository()
    
    async def export_all_data(self, full_sync: bool = False):
        """Export all data to automation-hub-core"""
        logger.info(f"Starting {'full' if full_sync else 'incremental'} data export")
        
        try:
            async with self.automation_hub_client as client:
                # 1. Export users first
                await self._export_users(client, full_sync)
                
                # 2. Export banks
                await self._export_banks(client, full_sync)
                
                # 3. Export transactions
                await self._export_transactions(client, full_sync)
                
            logger.info("Data export completed successfully")
            
        except Exception as e:
            logger.error(f"Export failed: {e}")
            raise
    
    async def _export_users(self, client: AutomationHubClient, full_sync: bool):
        """Export users to automation-hub-core"""
        users = self.user_repo.get_all() if full_sync else self.user_repo.get_recent()
        
        for user in users:
            user_data = {
                "external_id": str(user.id),
                "name": user.name,
                "email": user.email,
                "password_hash": user.password,  # Already hashed
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "metadata": {
                    "source": "bank-hub",
                    "phone_number": getattr(user, 'phone_number', None)
                }
            }
            
            try:
                result = await client.import_user(user_data)
                if result.get('data', {}).get('importUser', {}).get('success'):
                    logger.info(f"User {user.email} exported successfully")
                else:
                    logger.warning(f"User {user.email} export failed: {result}")
            except Exception as e:
                logger.error(f"Failed to export user {user.email}: {e}")
    
    async def _export_banks(self, client: AutomationHubClient, full_sync: bool):
        """Export banks to automation-hub-core"""
        banks = self.bank_repo.get_all() if full_sync else self.bank_repo.get_recent()
        
        for bank in banks:
            bank_data = {
                "external_id": str(bank.id),
                "user_external_id": str(bank.user_id),
                "name": bank.name,
                "type": getattr(bank, 'type', 'BANCO'),
                "is_active": True,
                "created_at": bank.created_at.isoformat() if bank.created_at else None,
                "metadata": {
                    "source": "bank-hub",
                    "institution_code": getattr(bank, 'institution_code', None)
                }
            }
            
            try:
                result = await client.import_bank(bank_data)
                if result.get('data', {}).get('importBank', {}).get('success'):
                    logger.info(f"Bank {bank.name} exported successfully")
                else:
                    logger.warning(f"Bank {bank.name} export failed: {result}")
            except Exception as e:
                logger.error(f"Failed to export bank {bank.name}: {e}")
    
    async def _export_transactions(self, client: AutomationHubClient, full_sync: bool):
        """Export transactions to automation-hub-core in batches"""
        if full_sync:
            transactions = self.transaction_repo.get_all()
        else:
            # Last 7 days for incremental sync
            since_date = datetime.now() - timedelta(days=7)
            transactions = self.transaction_repo.get_since_date(since_date)
        
        # Process in batches of 100
        batch_size = 100
        for i in range(0, len(transactions), batch_size):
            batch = transactions[i:i + batch_size]
            
            transaction_data = []
            for tx in batch:
                tx_data = {
                    "external_id": str(tx.id),
                    "bank_external_id": str(tx.bank_id),
                    "amount": float(tx.amount) if tx.amount else 0.0,
                    "description": tx.description or "",
                    "category": getattr(tx, 'category', 'OUTROS'),
                    "type": tx.type or "DEBIT",
                    "transaction_date": tx.transaction_date.isoformat() if tx.transaction_date else datetime.now().isoformat(),
                    "created_at": tx.created_at.isoformat() if tx.created_at else None,
                    "metadata": {
                        "source": "bank-hub",
                        "currency": getattr(tx, 'currency', 'BRL')
                    }
                }
                transaction_data.append(tx_data)
            
            try:
                result = await client.import_transactions_batch(transaction_data)
                batch_result = result.get('data', {}).get('importTransactions', {})
                logger.info(f"Batch {i//batch_size + 1}: {batch_result.get('successful', 0)} successful, {batch_result.get('failed', 0)} failed")
            except Exception as e:
                logger.error(f"Failed to export transaction batch {i//batch_size + 1}: {e}")
```

### 3. `src/scheduler/sync_scheduler.py`
```python
import schedule
import time
import asyncio
import logging
from src.services.export_service import ExportService

logger = logging.getLogger(__name__)

class SyncScheduler:
    def __init__(self):
        self.export_service = ExportService()
        self.is_running = False
    
    def setup_schedules(self):
        """Setup sync schedules"""
        # Incremental sync every 2 hours
        schedule.every(2).hours.do(self._run_incremental_sync)
        
        # Full sync daily at 3 AM
        schedule.every().day.at("03:00").do(self._run_full_sync)
        
        # Quick sync every 30 minutes during business hours (9-18)
        schedule.every(30).minutes.do(self._run_quick_sync_if_business_hours)
        
        logger.info("Sync schedules configured")
    
    def _run_incremental_sync(self):
        """Run incremental sync"""
        logger.info("Starting incremental sync")
        asyncio.run(self.export_service.export_all_data(full_sync=False))
    
    def _run_full_sync(self):
        """Run full sync"""
        logger.info("Starting full sync")
        asyncio.run(self.export_service.export_all_data(full_sync=True))
    
    def _run_quick_sync_if_business_hours(self):
        """Run quick sync only during business hours"""
        current_hour = time.localtime().tm_hour
        if 9 <= current_hour <= 18:
            logger.info("Starting quick sync (business hours)")
            asyncio.run(self.export_service.export_all_data(full_sync=False))
    
    def start(self):
        """Start the scheduler"""
        self.setup_schedules()
        self.is_running = True
        
        logger.info("Sync scheduler started")
        
        while self.is_running:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    
    def stop(self):
        """Stop the scheduler"""
        self.is_running = False
        schedule.clear()
        logger.info("Sync scheduler stopped")

# For running as standalone process
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    scheduler = SyncScheduler()
    
    try:
        scheduler.start()
    except KeyboardInterrupt:
        scheduler.stop()
```

### 4. `config/automation_hub_config.py`
```python
import os
from typing import Optional

class AutomationHubConfig:
    """Configuration for automation-hub-core integration"""
    
    # Automation Hub endpoints
    AUTOMATION_HUB_URL: str = os.getenv("AUTOMATION_HUB_URL", "http://localhost:4000")
    AUTOMATION_HUB_GRAPHQL_URL: str = f"{AUTOMATION_HUB_URL}/graphql"
    
    # Sync settings
    SYNC_ENABLED: bool = os.getenv("SYNC_ENABLED", "true").lower() == "true"
    FULL_SYNC_HOUR: int = int(os.getenv("FULL_SYNC_HOUR", "3"))
    INCREMENTAL_SYNC_HOURS: int = int(os.getenv("INCREMENTAL_SYNC_HOURS", "2"))
    QUICK_SYNC_MINUTES: int = int(os.getenv("QUICK_SYNC_MINUTES", "30"))
    
    # Batch settings
    TRANSACTION_BATCH_SIZE: int = int(os.getenv("TRANSACTION_BATCH_SIZE", "100"))
    
    # Retry settings
    MAX_RETRIES: int = int(os.getenv("MAX_RETRIES", "3"))
    RETRY_DELAY: int = int(os.getenv("RETRY_DELAY", "5"))
    
    # Authentication (if needed in future)
    API_KEY: Optional[str] = os.getenv("AUTOMATION_HUB_API_KEY")
    
    @classmethod
    def validate(cls):
        """Validate configuration"""
        if not cls.AUTOMATION_HUB_URL:
            raise ValueError("AUTOMATION_HUB_URL is required")
        
        if cls.TRANSACTION_BATCH_SIZE <= 0:
            raise ValueError("TRANSACTION_BATCH_SIZE must be positive")
```

---

## ✏️ Arquivos a Modificar

### 1. `main.py` - Adicionar integração
```python
# Adicionar no início
import asyncio
from src.services.export_service import ExportService
from src.scheduler.sync_scheduler import SyncScheduler
from config.automation_hub_config import AutomationHubConfig

# Adicionar comando para sync manual
async def sync_to_automation_hub(full_sync: bool = False):
    """Sync data to automation-hub-core"""
    export_service = ExportService()
    await export_service.export_all_data(full_sync=full_sync)
    print(f"{'Full' if full_sync else 'Incremental'} sync completed")

# Adicionar comando para iniciar scheduler
def start_sync_scheduler():
    """Start the sync scheduler"""
    scheduler = SyncScheduler()
    scheduler.start()

# Exemplo de uso:
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "sync":
            full = "--full" in sys.argv
            asyncio.run(sync_to_automation_hub(full_sync=full))
        elif command == "scheduler":
            start_sync_scheduler()
        else:
            print("Unknown command")
    else:
        # Seu código original aqui
        pass
```

### 2. `src/infrastructure/repositories.py` - Adicionar métodos de consulta
```python
# Adicionar estes métodos às classes Repository existentes

class UserRepository:
    # ... métodos existentes ...
    
    def get_recent(self, days: int = 7):
        """Get users created/updated in the last N days"""
        from datetime import datetime, timedelta
        since_date = datetime.now() - timedelta(days=days)
        
        # Implementar consulta baseada no seu ORM
        # Exemplo SQLAlchemy:
        # return self.session.query(User).filter(
        #     or_(User.created_at >= since_date, User.updated_at >= since_date)
        # ).all()
        pass

class BankRepository:
    # ... métodos existentes ...
    
    def get_recent(self, days: int = 7):
        """Get banks created/updated in the last N days"""
        # Implementar similar ao UserRepository
        pass

class TransactionRepository:
    # ... métodos existentes ...
    
    def get_since_date(self, since_date):
        """Get transactions since a specific date"""
        # Implementar consulta por data
        pass
    
    def get_recent(self, days: int = 7):
        """Get recent transactions"""
        from datetime import datetime, timedelta
        since_date = datetime.now() - timedelta(days=days)
        return self.get_since_date(since_date)
```

### 3. `.env` - Adicionar configurações
```env
# Automation Hub Integration
AUTOMATION_HUB_URL=http://localhost:4000
SYNC_ENABLED=true
FULL_SYNC_HOUR=3
INCREMENTAL_SYNC_HOURS=2
QUICK_SYNC_MINUTES=30
TRANSACTION_BATCH_SIZE=100
MAX_RETRIES=3
RETRY_DELAY=5
```

---

## 🔧 Scripts de Utilidade

### 1. `scripts/test_integration.py`
```python
#!/usr/bin/env python3
"""Test integration with automation-hub-core"""

import asyncio
import sys
sys.path.append('.')

from src.clients.automation_hub_client import AutomationHubClient

async def test_connection():
    """Test connection to automation-hub-core"""
    async with AutomationHubClient() as client:
        # Test health check query
        query = """
        query {
            getImportHealth
        }
        """
        
        try:
            result = await client.execute_mutation(query)
            print("✅ Connection successful!")
            print(f"Health: {result}")
            return True
        except Exception as e:
            print(f"❌ Connection failed: {e}")
            return False

async def test_user_import():
    """Test user import"""
    async with AutomationHubClient() as client:
        test_user = {
            "external_id": "test_user_001",
            "name": "Test User",
            "email": "test@example.com",
            "password_hash": "hashed_password",
            "metadata": {"source": "bank-hub-test"}
        }
        
        try:
            result = await client.import_user(test_user)
            print("✅ User import test successful!")
            print(f"Result: {result}")
            return True
        except Exception as e:
            print(f"❌ User import test failed: {e}")
            return False

if __name__ == "__main__":
    print("Testing integration with automation-hub-core...")
    
    async def run_tests():
        connection_ok = await test_connection()
        if connection_ok:
            await test_user_import()
    
    asyncio.run(run_tests())
```

### 2. `scripts/manual_sync.py`
```python
#!/usr/bin/env python3
"""Manual sync script"""

import asyncio
import sys
import argparse
sys.path.append('.')

from src.services.export_service import ExportService

async def main():
    parser = argparse.ArgumentParser(description='Manual sync to automation-hub-core')
    parser.add_argument('--full', action='store_true', help='Run full sync')
    parser.add_argument('--users-only', action='store_true', help='Sync users only')
    parser.add_argument('--banks-only', action='store_true', help='Sync banks only')
    parser.add_argument('--transactions-only', action='store_true', help='Sync transactions only')
    
    args = parser.parse_args()
    
    export_service = ExportService()
    
    try:
        if args.users_only:
            async with export_service.automation_hub_client as client:
                await export_service._export_users(client, args.full)
        elif args.banks_only:
            async with export_service.automation_hub_client as client:
                await export_service._export_banks(client, args.full)
        elif args.transactions_only:
            async with export_service.automation_hub_client as client:
                await export_service._export_transactions(client, args.full)
        else:
            await export_service.export_all_data(args.full)
        
        print("✅ Sync completed successfully!")
        
    except Exception as e:
        print(f"❌ Sync failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
```

---

## 📋 Checklist de Implementação

### ✅ Preparação
- [ ] Instalar dependências: `pip install aiohttp schedule pydantic`
- [ ] Verificar se automation-hub-core está rodando
- [ ] Configurar variáveis de ambiente

### ✅ Implementação Core
- [ ] Criar `src/clients/automation_hub_client.py`
- [ ] Criar `src/services/export_service.py`
- [ ] Criar `src/scheduler/sync_scheduler.py`
- [ ] Criar `config/automation_hub_config.py`

### ✅ Modificações
- [ ] Atualizar `main.py` com comandos de sync
- [ ] Adicionar métodos `get_recent()` nos repositories
- [ ] Configurar `.env` com variáveis do automation-hub

### ✅ Scripts de Utilidade
- [ ] Criar `scripts/test_integration.py`
- [ ] Criar `scripts/manual_sync.py`

### ✅ Testes
- [ ] Testar conexão: `python scripts/test_integration.py`
- [ ] Testar sync manual: `python scripts/manual_sync.py --full`
- [ ] Testar scheduler: `python main.py scheduler`

---

## 🚀 Comandos de Uso

### Após implementação:

```bash
# Testar conexão
python scripts/test_integration.py

# Sync manual completo
python scripts/manual_sync.py --full

# Sync incremental
python scripts/manual_sync.py

# Sync apenas usuários
python scripts/manual_sync.py --users-only

# Iniciar scheduler automático
python main.py scheduler

# Sync via main.py
python main.py sync --full
```

---

## 🎯 Resultado Final

Após implementar essas alterações, o bank-hub irá:

1. **🔄 Sincronizar automaticamente** dados com automation-hub-core
2. **📊 Manter cache local** no SQLite para performance  
3. **⚡ Sync inteligente** (incremental vs full)
4. **🛡️ Tratamento de erros** e retry automático
5. **📈 Monitoramento** via logs
6. **🎮 Controle manual** via scripts

O sistema ficará totalmente integrado e os dados bancários fluirão automaticamente do bank-hub para o automation-hub-core! 🚀
