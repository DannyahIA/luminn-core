#!/usr/bin/env python3
"""
SQLite to PostgreSQL Migration Script
Migrates data from the SQLite database to PostgreSQL
"""

import sqlite3
import psycopg2
from psycopg2.extras import RealDictCursor
import sys
import os
from datetime import datetime
import uuid

# Database configurations
SQLITE_DB_PATH = "../bank-hub/bankhub.db"
POSTGRES_CONFIG = {
    'host': 'localhost',
    'database': 'bankhub',
    'user': 'bankhub_user',
    'password': 'your_secure_password',
    'port': 5432
}

def connect_sqlite():
    """Connect to SQLite database"""
    try:
        if not os.path.exists(SQLITE_DB_PATH):
            print(f"SQLite database not found at: {SQLITE_DB_PATH}")
            return None
        
        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row  # Enable column access by name
        return conn
    except Exception as e:
        print(f"Error connecting to SQLite: {e}")
        return None

def connect_postgres():
    """Connect to PostgreSQL database"""
    try:
        conn = psycopg2.connect(**POSTGRES_CONFIG)
        return conn
    except Exception as e:
        print(f"Error connecting to PostgreSQL: {e}")
        print("Make sure PostgreSQL is running and credentials are correct")
        return None

def get_table_data(sqlite_conn, table_name):
    """Get all data from a SQLite table"""
    try:
        cursor = sqlite_conn.cursor()
        cursor.execute(f"SELECT * FROM {table_name}")
        return cursor.fetchall()
    except sqlite3.Error as e:
        print(f"Error reading from table {table_name}: {e}")
        return []

def migrate_table(sqlite_conn, postgres_conn, table_name, columns):
    """Migrate data from SQLite to PostgreSQL for a specific table"""
    print(f"Migrating table: {table_name}")
    
    # Get data from SQLite
    data = get_table_data(sqlite_conn, table_name)
    if not data:
        print(f"  No data found in {table_name}")
        return True
    
    try:
        postgres_cursor = postgres_conn.cursor()
        
        # Prepare insert statement
        placeholders = ', '.join(['%s'] * len(columns))
        insert_sql = f"INSERT INTO {table_name} ({', '.join(columns)}) VALUES ({placeholders})"
        
        # Insert data
        for row in data:
            values = []
            for col in columns:
                value = row[col] if col in row.keys() else None
                # Convert datetime strings if needed
                if col in ['created_at', 'updated_at', 'transaction_date'] and value:
                    try:
                        # Parse SQLite datetime format and convert to PostgreSQL format
                        if isinstance(value, str):
                            dt = datetime.fromisoformat(value.replace('Z', '+00:00'))
                            value = dt
                    except:
                        pass
                values.append(value)
            
            postgres_cursor.execute(insert_sql, values)
        
        postgres_conn.commit()
        print(f"  Successfully migrated {len(data)} rows")
        return True
        
    except Exception as e:
        print(f"  Error migrating {table_name}: {e}")
        postgres_conn.rollback()
        return False

def clear_postgres_tables(postgres_conn):
    """Clear all data from PostgreSQL tables (for clean migration)"""
    print("Clearing existing PostgreSQL data...")
    
    tables = [
        'transaction', 'products', 'bank_item', 'bank_data', 
        'bank_account', 'bank', 'pluggy_credentials', 'users'
    ]
    
    try:
        cursor = postgres_conn.cursor()
        for table in tables:
            cursor.execute(f"DELETE FROM {table}")
        postgres_conn.commit()
        print("PostgreSQL tables cleared")
        return True
    except Exception as e:
        print(f"Error clearing tables: {e}")
        return False

def verify_migration(postgres_conn):
    """Verify the migration by counting rows in each table"""
    print("\nVerification - Row counts in PostgreSQL:")
    
    tables = [
        'users', 'pluggy_credentials', 'bank', 'bank_account',
        'bank_data', 'bank_item', 'products', 'transaction'
    ]
    
    try:
        cursor = postgres_conn.cursor()
        for table in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            print(f"  {table}: {count} rows")
    except Exception as e:
        print(f"Error during verification: {e}")

def main():
    """Main migration function"""
    print("Starting SQLite to PostgreSQL migration...")
    
    # Connect to databases
    sqlite_conn = connect_sqlite()
    if not sqlite_conn:
        sys.exit(1)
    
    postgres_conn = connect_postgres()
    if not postgres_conn:
        sqlite_conn.close()
        sys.exit(1)
    
    try:
        # Clear existing data (optional - comment out if you want to keep existing data)
        if input("Clear existing PostgreSQL data? (y/N): ").lower() == 'y':
            if not clear_postgres_tables(postgres_conn):
                sys.exit(1)
        
        # Define table schemas for migration
        table_schemas = {
            'users': ['id', 'name', 'email', 'password', 'phone_number', 'created_at', 'updated_at'],
            'pluggy_credentials': ['id', 'user_id', 'client_id', 'client_secret', 'base_url', 'created_at', 'updated_at'],
            'bank': ['id', 'user_id', 'name', 'created_at', 'updated_at'],
            'bank_account': ['id', 'user_id', 'bank_id', 'account_id', 'type', 'balance', 'currency_code', 'created_at', 'updated_at'],
            'bank_data': ['id', 'bank_account_id', 'transfer_number', 'closing_balance', 'automatically_invested_balance', 'overdraft_contracted_limit', 'overdraft_used_limit', 'unarranged_overdraft_amount', 'created_at', 'updated_at'],
            'bank_item': ['id', 'bank_id', 'name', 'status', 'execution_status', 'created_at', 'updated_at'],
            'products': ['id', 'bank_item_id', 'name', 'created_at', 'updated_at'],
            'transaction': ['id', 'bank_id', 'type', 'amount', 'currency', 'description', 'transaction_date', 'created_at', 'updated_at']
        }
        
        # Migrate each table
        success = True
        for table_name, columns in table_schemas.items():
            if not migrate_table(sqlite_conn, postgres_conn, table_name, columns):
                success = False
                break
        
        if success:
            print("\nMigration completed successfully!")
            verify_migration(postgres_conn)
        else:
            print("\nMigration failed!")
    
    finally:
        # Close connections
        sqlite_conn.close()
        postgres_conn.close()

if __name__ == "__main__":
    # Check if required packages are installed
    try:
        import psycopg2
    except ImportError:
        print("psycopg2 not found. Install it with: pip install psycopg2-binary")
        sys.exit(1)
    
    main()
