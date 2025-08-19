"""
Adapters layer - REST API controllers
"""
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from src.infrastructure.database import get_db
from src.infrastructure.repositories import SQLUserRepository, SQLBankRepository, SQLBankAccountRepository, SQLTransactionRepository
from src.application.services import UserService, BankService, BankAccountService, TransactionService


# Pydantic models for request/response
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    phone_number: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone_number: Optional[str]
    created_at: datetime
    updated_at: datetime


class BankCreate(BaseModel):
    user_id: str
    name: str


class BankResponse(BaseModel):
    id: str
    user_id: str
    name: str
    created_at: datetime
    updated_at: datetime


class BankAccountCreate(BaseModel):
    user_id: str
    bank_id: str
    account_id: str
    type: str
    balance: float
    currency_code: str


class BankAccountResponse(BaseModel):
    id: str
    user_id: str
    bank_id: str
    account_id: str
    type: str
    balance: float
    currency_code: str
    created_at: datetime
    updated_at: datetime


class TransactionCreate(BaseModel):
    bank_id: str
    type: str
    amount: float
    currency: str
    description: str
    transaction_date: datetime


class TransactionResponse(BaseModel):
    id: str
    bank_id: str
    type: str
    amount: float
    currency: str
    description: str
    transaction_date: datetime
    created_at: datetime
    updated_at: datetime


class UserController:
    def create_user(self, user: UserCreate, db: Session = Depends(get_db)) -> UserResponse:
        user_repository = SQLUserRepository(db)
        user_service = UserService(user_repository)
        
        try:
            created_user = user_service.create_user(
                name=user.name,
                email=user.email,
                password=user.password,
                phone_number=user.phone_number
            )
            
            return UserResponse(
                id=created_user.id,
                name=created_user.name,
                email=created_user.email,
                phone_number=created_user.phone_number,
                created_at=created_user.created_at,
                updated_at=created_user.updated_at
            )
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
    
    def get_user(self, user_id: str, db: Session = Depends(get_db)) -> UserResponse:
        user_repository = SQLUserRepository(db)
        user_service = UserService(user_repository)
        
        user = user_service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        return UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            phone_number=user.phone_number,
            created_at=user.created_at,
            updated_at=user.updated_at
        )


class BankController:
    def create_bank(self, bank: BankCreate, db: Session = Depends(get_db)) -> BankResponse:
        bank_repository = SQLBankRepository(db)
        bank_service = BankService(bank_repository)
        
        created_bank = bank_service.create_bank(
            user_id=bank.user_id,
            name=bank.name
        )
        
        return BankResponse(
            id=created_bank.id,
            user_id=created_bank.user_id,
            name=created_bank.name,
            created_at=created_bank.created_at,
            updated_at=created_bank.updated_at
        )
    
    def get_banks_by_user(self, user_id: str, db: Session = Depends(get_db)) -> List[BankResponse]:
        bank_repository = SQLBankRepository(db)
        bank_service = BankService(bank_repository)
        
        banks = bank_service.get_banks_by_user(user_id)
        
        return [
            BankResponse(
                id=bank.id,
                user_id=bank.user_id,
                name=bank.name,
                created_at=bank.created_at,
                updated_at=bank.updated_at
            ) for bank in banks
        ]


class BankAccountController:
    def create_account(self, account: BankAccountCreate, db: Session = Depends(get_db)) -> BankAccountResponse:
        account_repository = SQLBankAccountRepository(db)
        account_service = BankAccountService(account_repository)
        
        created_account = account_service.create_account(
            user_id=account.user_id,
            bank_id=account.bank_id,
            account_id=account.account_id,
            account_type=account.type,
            balance=account.balance,
            currency_code=account.currency_code
        )
        
        return BankAccountResponse(
            id=created_account.id,
            user_id=created_account.user_id,
            bank_id=created_account.bank_id,
            account_id=created_account.account_id,
            type=created_account.type,
            balance=created_account.balance,
            currency_code=created_account.currency_code,
            created_at=created_account.created_at,
            updated_at=created_account.updated_at
        )
    
    def get_accounts_by_bank(self, bank_id: str, db: Session = Depends(get_db)) -> List[BankAccountResponse]:
        account_repository = SQLBankAccountRepository(db)
        account_service = BankAccountService(account_repository)
        
        accounts = account_service.get_accounts_by_bank(bank_id)
        
        return [
            BankAccountResponse(
                id=account.id,
                user_id=account.user_id,
                bank_id=account.bank_id,
                account_id=account.account_id,
                type=account.type,
                balance=account.balance,
                currency_code=account.currency_code,
                created_at=account.created_at,
                updated_at=account.updated_at
            ) for account in accounts
        ]


class TransactionController:
    def create_transaction(self, transaction: TransactionCreate, db: Session = Depends(get_db)) -> TransactionResponse:
        transaction_repository = SQLTransactionRepository(db)
        transaction_service = TransactionService(transaction_repository)
        
        created_transaction = transaction_service.create_transaction(
            bank_id=transaction.bank_id,
            transaction_type=transaction.type,
            amount=transaction.amount,
            currency=transaction.currency,
            description=transaction.description,
            transaction_date=transaction.transaction_date
        )
        
        return TransactionResponse(
            id=created_transaction.id,
            bank_id=created_transaction.bank_id,
            type=created_transaction.type,
            amount=created_transaction.amount,
            currency=created_transaction.currency,
            description=created_transaction.description,
            transaction_date=created_transaction.transaction_date,
            created_at=created_transaction.created_at,
            updated_at=created_transaction.updated_at
        )
    
    def get_transactions_by_bank(self, bank_id: str, db: Session = Depends(get_db)) -> List[TransactionResponse]:
        transaction_repository = SQLTransactionRepository(db)
        transaction_service = TransactionService(transaction_repository)
        
        transactions = transaction_service.get_transactions_by_bank(bank_id)
        
        return [
            TransactionResponse(
                id=transaction.id,
                bank_id=transaction.bank_id,
                type=transaction.type,
                amount=transaction.amount,
                currency=transaction.currency,
                description=transaction.description,
                transaction_date=transaction.transaction_date,
                created_at=transaction.created_at,
                updated_at=transaction.updated_at
            ) for transaction in transactions
        ]
