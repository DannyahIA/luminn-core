"""
Bank Hub Microservice - Main Application
Arquitetura Hexagonal para integração com GraphQL Core
"""
from fastapi import FastAPI
from typing import List

from src.adapters.controllers import (
    UserController, 
    BankController, 
    BankAccountController, 
    TransactionController,
    UserCreate,
    UserResponse,
    BankCreate,
    BankResponse,
    BankAccountCreate,
    BankAccountResponse,
    TransactionCreate,
    TransactionResponse
)

# Initialize FastAPI app
app = FastAPI(
    title="Bank Hub Microservice",
    description="Microserviço para gerenciamento de dados bancários integrado com GraphQL",
    version="1.0.0"
)

# Initialize controllers
user_controller = UserController()
bank_controller = BankController()
account_controller = BankAccountController()
transaction_controller = TransactionController()


# User routes
@app.post("/users", response_model=UserResponse, tags=["Users"])
def create_user(user: UserCreate):
    return user_controller.create_user(user)


@app.get("/users/{user_id}", response_model=UserResponse, tags=["Users"])
def get_user(user_id: str):
    return user_controller.get_user(user_id)


# Bank routes
@app.post("/banks", response_model=BankResponse, tags=["Banks"])
def create_bank(bank: BankCreate):
    return bank_controller.create_bank(bank)


@app.get("/users/{user_id}/banks", response_model=List[BankResponse], tags=["Banks"])
def get_user_banks(user_id: str):
    return bank_controller.get_banks_by_user(user_id)


# Bank Account routes
@app.post("/accounts", response_model=BankAccountResponse, tags=["Accounts"])
def create_account(account: BankAccountCreate):
    return account_controller.create_account(account)


@app.get("/banks/{bank_id}/accounts", response_model=List[BankAccountResponse], tags=["Accounts"])
def get_bank_accounts(bank_id: str):
    return account_controller.get_accounts_by_bank(bank_id)


# Transaction routes
@app.post("/transactions", response_model=TransactionResponse, tags=["Transactions"])
def create_transaction(transaction: TransactionCreate):
    return transaction_controller.create_transaction(transaction)


@app.get("/banks/{bank_id}/transactions", response_model=List[TransactionResponse], tags=["Transactions"])
def get_bank_transactions(bank_id: str):
    return transaction_controller.get_transactions_by_bank(bank_id)


# Health check
@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "service": "bank-hub"}
