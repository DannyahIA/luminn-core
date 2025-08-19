"""
Application layer - Use cases and business logic
"""
from abc import ABC, abstractmethod
from typing import List, Optional
from src.domain.entities import User, Bank, BankAccount, Transaction


class UserRepository(ABC):
    @abstractmethod
    def create(self, user: User) -> User:
        pass
    
    @abstractmethod
    def get_by_id(self, user_id: str) -> Optional[User]:
        pass
    
    @abstractmethod
    def get_by_email(self, email: str) -> Optional[User]:
        pass
    
    @abstractmethod
    def update(self, user: User) -> User:
        pass


class BankRepository(ABC):
    @abstractmethod
    def create(self, bank: Bank) -> Bank:
        pass
    
    @abstractmethod
    def get_by_user_id(self, user_id: str) -> List[Bank]:
        pass
    
    @abstractmethod
    def get_by_id(self, bank_id: str) -> Optional[Bank]:
        pass


class BankAccountRepository(ABC):
    @abstractmethod
    def create(self, account: BankAccount) -> BankAccount:
        pass
    
    @abstractmethod
    def get_by_bank_id(self, bank_id: str) -> List[BankAccount]:
        pass
    
    @abstractmethod
    def get_by_user_id(self, user_id: str) -> List[BankAccount]:
        pass


class TransactionRepository(ABC):
    @abstractmethod
    def create(self, transaction: Transaction) -> Transaction:
        pass
    
    @abstractmethod
    def get_by_bank_id(self, bank_id: str) -> List[Transaction]:
        pass
    
    @abstractmethod
    def get_by_account_id(self, account_id: str) -> List[Transaction]:
        pass


class UserService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository
    
    def create_user(self, name: str, email: str, password: str, phone_number: str = None) -> User:
        # Check if user already exists
        existing_user = self.user_repository.get_by_email(email)
        if existing_user:
            raise ValueError("Email já cadastrado")
        
        user = User(
            id="",  # Will be generated in __post_init__
            name=name,
            email=email,
            password=password,
            phone_number=phone_number
        )
        
        return self.user_repository.create(user)
    
    def get_user_by_id(self, user_id: str) -> Optional[User]:
        return self.user_repository.get_by_id(user_id)


class BankService:
    def __init__(self, bank_repository: BankRepository):
        self.bank_repository = bank_repository
    
    def create_bank(self, user_id: str, name: str) -> Bank:
        bank = Bank(
            id="",  # Will be generated in __post_init__
            user_id=user_id,
            name=name
        )
        
        return self.bank_repository.create(bank)
    
    def get_banks_by_user(self, user_id: str) -> List[Bank]:
        return self.bank_repository.get_by_user_id(user_id)


class BankAccountService:
    def __init__(self, account_repository: BankAccountRepository):
        self.account_repository = account_repository
    
    def create_account(self, user_id: str, bank_id: str, account_id: str, 
                      account_type: str, balance: float, currency_code: str) -> BankAccount:
        account = BankAccount(
            id="",  # Will be generated in __post_init__
            user_id=user_id,
            bank_id=bank_id,
            account_id=account_id,
            type=account_type,
            balance=balance,
            currency_code=currency_code
        )
        
        return self.account_repository.create(account)
    
    def get_accounts_by_bank(self, bank_id: str) -> List[BankAccount]:
        return self.account_repository.get_by_bank_id(bank_id)


class TransactionService:
    def __init__(self, transaction_repository: TransactionRepository):
        self.transaction_repository = transaction_repository
    
    def create_transaction(self, bank_id: str, transaction_type: str, amount: float,
                          currency: str, description: str, transaction_date) -> Transaction:
        transaction = Transaction(
            id="",  # Will be generated in __post_init__
            bank_id=bank_id,
            type=transaction_type,
            amount=amount,
            currency=currency,
            description=description,
            transaction_date=transaction_date
        )
        
        return self.transaction_repository.create(transaction)
    
    def get_transactions_by_bank(self, bank_id: str) -> List[Transaction]:
        return self.transaction_repository.get_by_bank_id(bank_id)
