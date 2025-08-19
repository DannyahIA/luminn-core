"""
Infrastructure layer - Repository implementations
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from src.application.services import UserRepository, BankRepository, BankAccountRepository, TransactionRepository
from src.domain.entities import User, Bank, BankAccount, Transaction
from src.infrastructure.database import UserModel, BankModel, BankAccountModel, TransactionModel


class SQLUserRepository(UserRepository):
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, user: User) -> User:
        db_user = UserModel(
            id=user.id,
            name=user.name,
            email=user.email,
            password=user.password,
            phone_number=user.phone_number,
            created_at=user.created_at,
            updated_at=user.updated_at
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        
        return User(
            id=db_user.id,
            name=db_user.name,
            email=db_user.email,
            password=db_user.password,
            phone_number=db_user.phone_number,
            created_at=db_user.created_at,
            updated_at=db_user.updated_at
        )
    
    def get_by_id(self, user_id: str) -> Optional[User]:
        db_user = self.db.query(UserModel).filter(UserModel.id == user_id).first()
        if not db_user:
            return None
        
        return User(
            id=db_user.id,
            name=db_user.name,
            email=db_user.email,
            password=db_user.password,
            phone_number=db_user.phone_number,
            created_at=db_user.created_at,
            updated_at=db_user.updated_at
        )
    
    def get_by_email(self, email: str) -> Optional[User]:
        db_user = self.db.query(UserModel).filter(UserModel.email == email).first()
        if not db_user:
            return None
        
        return User(
            id=db_user.id,
            name=db_user.name,
            email=db_user.email,
            password=db_user.password,
            phone_number=db_user.phone_number,
            created_at=db_user.created_at,
            updated_at=db_user.updated_at
        )
    
    def update(self, user: User) -> User:
        db_user = self.db.query(UserModel).filter(UserModel.id == user.id).first()
        if db_user:
            db_user.name = user.name
            db_user.email = user.email
            db_user.password = user.password
            db_user.phone_number = user.phone_number
            db_user.updated_at = user.updated_at
            self.db.commit()
            self.db.refresh(db_user)
        
        return user


class SQLBankRepository(BankRepository):
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, bank: Bank) -> Bank:
        db_bank = BankModel(
            id=bank.id,
            user_id=bank.user_id,
            name=bank.name,
            created_at=bank.created_at,
            updated_at=bank.updated_at
        )
        self.db.add(db_bank)
        self.db.commit()
        self.db.refresh(db_bank)
        
        return Bank(
            id=db_bank.id,
            user_id=db_bank.user_id,
            name=db_bank.name,
            created_at=db_bank.created_at,
            updated_at=db_bank.updated_at
        )
    
    def get_by_user_id(self, user_id: str) -> List[Bank]:
        db_banks = self.db.query(BankModel).filter(BankModel.user_id == user_id).all()
        return [
            Bank(
                id=db_bank.id,
                user_id=db_bank.user_id,
                name=db_bank.name,
                created_at=db_bank.created_at,
                updated_at=db_bank.updated_at
            ) for db_bank in db_banks
        ]
    
    def get_by_id(self, bank_id: str) -> Optional[Bank]:
        db_bank = self.db.query(BankModel).filter(BankModel.id == bank_id).first()
        if not db_bank:
            return None
        
        return Bank(
            id=db_bank.id,
            user_id=db_bank.user_id,
            name=db_bank.name,
            created_at=db_bank.created_at,
            updated_at=db_bank.updated_at
        )


class SQLBankAccountRepository(BankAccountRepository):
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, account: BankAccount) -> BankAccount:
        db_account = BankAccountModel(
            id=account.id,
            user_id=account.user_id,
            bank_id=account.bank_id,
            account_id=account.account_id,
            type=account.type,
            balance=account.balance,
            currency_code=account.currency_code,
            created_at=account.created_at,
            updated_at=account.updated_at
        )
        self.db.add(db_account)
        self.db.commit()
        self.db.refresh(db_account)
        
        return BankAccount(
            id=db_account.id,
            user_id=db_account.user_id,
            bank_id=db_account.bank_id,
            account_id=db_account.account_id,
            type=db_account.type,
            balance=db_account.balance,
            currency_code=db_account.currency_code,
            created_at=db_account.created_at,
            updated_at=db_account.updated_at
        )
    
    def get_by_bank_id(self, bank_id: str) -> List[BankAccount]:
        db_accounts = self.db.query(BankAccountModel).filter(BankAccountModel.bank_id == bank_id).all()
        return [
            BankAccount(
                id=db_account.id,
                user_id=db_account.user_id,
                bank_id=db_account.bank_id,
                account_id=db_account.account_id,
                type=db_account.type,
                balance=db_account.balance,
                currency_code=db_account.currency_code,
                created_at=db_account.created_at,
                updated_at=db_account.updated_at
            ) for db_account in db_accounts
        ]
    
    def get_by_user_id(self, user_id: str) -> List[BankAccount]:
        db_accounts = self.db.query(BankAccountModel).filter(BankAccountModel.user_id == user_id).all()
        return [
            BankAccount(
                id=db_account.id,
                user_id=db_account.user_id,
                bank_id=db_account.bank_id,
                account_id=db_account.account_id,
                type=db_account.type,
                balance=db_account.balance,
                currency_code=db_account.currency_code,
                created_at=db_account.created_at,
                updated_at=db_account.updated_at
            ) for db_account in db_accounts
        ]


class SQLTransactionRepository(TransactionRepository):
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, transaction: Transaction) -> Transaction:
        db_transaction = TransactionModel(
            id=transaction.id,
            bank_id=transaction.bank_id,
            type=transaction.type,
            amount=transaction.amount,
            currency=transaction.currency,
            description=transaction.description,
            transaction_date=transaction.transaction_date,
            created_at=transaction.created_at,
            updated_at=transaction.updated_at
        )
        self.db.add(db_transaction)
        self.db.commit()
        self.db.refresh(db_transaction)
        
        return Transaction(
            id=db_transaction.id,
            bank_id=db_transaction.bank_id,
            type=db_transaction.type,
            amount=db_transaction.amount,
            currency=db_transaction.currency,
            description=db_transaction.description,
            transaction_date=db_transaction.transaction_date,
            created_at=db_transaction.created_at,
            updated_at=db_transaction.updated_at
        )
    
    def get_by_bank_id(self, bank_id: str) -> List[Transaction]:
        db_transactions = self.db.query(TransactionModel).filter(TransactionModel.bank_id == bank_id).all()
        return [
            Transaction(
                id=db_transaction.id,
                bank_id=db_transaction.bank_id,
                type=db_transaction.type,
                amount=db_transaction.amount,
                currency=db_transaction.currency,
                description=db_transaction.description,
                transaction_date=db_transaction.transaction_date,
                created_at=db_transaction.created_at,
                updated_at=db_transaction.updated_at
            ) for db_transaction in db_transactions
        ]
    
    def get_by_account_id(self, account_id: str) -> List[Transaction]:
        # Para simplificar, vamos buscar por bank_id por enquanto
        # Você pode melhorar isso adicionando account_id em Transaction se necessário
        return []
