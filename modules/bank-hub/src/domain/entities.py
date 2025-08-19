"""
Domain entities - Core business models
"""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional, List
import uuid


@dataclass
class User:
    id: str
    name: str
    email: str
    password: str
    phone_number: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def __post_init__(self):
        if not self.id:
            self.id = str(uuid.uuid4())
        if not self.created_at:
            self.created_at = datetime.utcnow()
        if not self.updated_at:
            self.updated_at = datetime.utcnow()


@dataclass
class PluggyCredentials:
    id: str
    user_id: str
    client_id: str
    client_secret: str
    base_url: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def __post_init__(self):
        if not self.id:
            self.id = str(uuid.uuid4())
        if not self.created_at:
            self.created_at = datetime.utcnow()
        if not self.updated_at:
            self.updated_at = datetime.utcnow()


@dataclass
class Bank:
    id: str
    user_id: str
    name: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def __post_init__(self):
        if not self.id:
            self.id = str(uuid.uuid4())
        if not self.created_at:
            self.created_at = datetime.utcnow()
        if not self.updated_at:
            self.updated_at = datetime.utcnow()


@dataclass
class BankAccount:
    id: str
    user_id: str
    bank_id: str
    account_id: str
    type: str
    balance: float
    currency_code: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def __post_init__(self):
        if not self.id:
            self.id = str(uuid.uuid4())
        if not self.created_at:
            self.created_at = datetime.utcnow()
        if not self.updated_at:
            self.updated_at = datetime.utcnow()


@dataclass
class BankData:
    id: str
    bank_account_id: str
    transfer_number: str
    closing_balance: float
    automatically_invested_balance: float
    overdraft_contracted_limit: float
    overdraft_used_limit: float
    unarranged_overdraft_amount: float
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def __post_init__(self):
        if not self.id:
            self.id = str(uuid.uuid4())
        if not self.created_at:
            self.created_at = datetime.utcnow()
        if not self.updated_at:
            self.updated_at = datetime.utcnow()


@dataclass
class BankItem:
    id: str
    bank_id: str
    name: str
    status: str
    execution_status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def __post_init__(self):
        if not self.id:
            self.id = str(uuid.uuid4())
        if not self.created_at:
            self.created_at = datetime.utcnow()
        if not self.updated_at:
            self.updated_at = datetime.utcnow()


@dataclass
class Product:
    id: str
    bank_item_id: str
    name: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def __post_init__(self):
        if not self.id:
            self.id = str(uuid.uuid4())
        if not self.created_at:
            self.created_at = datetime.utcnow()
        if not self.updated_at:
            self.updated_at = datetime.utcnow()


@dataclass
class Transaction:
    id: str
    bank_id: str
    type: str
    amount: float
    currency: str
    description: str
    transaction_date: datetime
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def __post_init__(self):
        if not self.id:
            self.id = str(uuid.uuid4())
        if not self.created_at:
            self.created_at = datetime.utcnow()
        if not self.updated_at:
            self.updated_at = datetime.utcnow()
