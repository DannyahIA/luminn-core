"""
Infrastructure layer - Database configuration and repositories
"""
from sqlalchemy import create_engine, Column, String, Float, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
import uuid

DATABASE_URL = "sqlite:///./bankhub.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# SQLAlchemy Models
class UserModel(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    phone_number = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class PluggyCredentialsModel(Base):
    __tablename__ = "pluggy_credentials"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    client_id = Column(String)
    client_secret = Column(String)
    base_url = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class BankModel(Base):
    __tablename__ = "bank"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class BankAccountModel(Base):
    __tablename__ = "bank_account"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    bank_id = Column(String, ForeignKey("bank.id"))
    account_id = Column(String)
    type = Column(String)
    balance = Column(Float)
    currency_code = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class BankDataModel(Base):
    __tablename__ = "bank_data"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    bank_account_id = Column(String, ForeignKey("bank_account.id"))
    transfer_number = Column(String)
    closing_balance = Column(Float)
    automatically_invested_balance = Column(Float)
    overdraft_contracted_limit = Column(Float)
    overdraft_used_limit = Column(Float)
    unarranged_overdraft_amount = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class BankItemModel(Base):
    __tablename__ = "bank_item"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    bank_id = Column(String, ForeignKey("bank.id"))
    name = Column(String)
    status = Column(String)
    execution_status = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ProductModel(Base):
    __tablename__ = "products"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    bank_item_id = Column(String, ForeignKey("bank_item.id"))
    name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class TransactionModel(Base):
    __tablename__ = "transaction"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    bank_id = Column(String, ForeignKey("bank.id"))
    type = Column(String)
    amount = Column(Float)
    currency = Column(String)
    description = Column(String)
    transaction_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# Create tables
Base.metadata.create_all(bind=engine)


def get_db():
    """Database dependency for FastAPI"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
