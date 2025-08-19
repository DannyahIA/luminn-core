# PostgreSQL Configuration for Bank Hub Migration

## Setup Instructions

### 1. Install PostgreSQL
```bash
# Windows (usando chocolatey)
choco install postgresql

# Or download from: https://www.postgresql.org/download/windows/
```

### 2. Create Database
```sql
-- Connect as postgres user
psql -U postgres

-- Create database
CREATE DATABASE bankhub;

-- Create user (optional)
CREATE USER bankhub_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE bankhub TO bankhub_user;

-- Exit psql
\q
```

### 3. Run Schema Creation
```bash
# Run the schema file
psql -U postgres -d bankhub -f scripts/postgresql_schema.sql

# Or with custom user
psql -U bankhub_user -d bankhub -f scripts/postgresql_schema.sql
```

### 4. Update Connection String
Update your application's database connection string from:
```
sqlite:///./bankhub.db
```

To:
```
postgresql://bankhub_user:your_secure_password@localhost:5432/bankhub
```

## Key Differences from SQLite

1. **Data Types**:
   - `String` → `VARCHAR(255)` or `TEXT`
   - `Float` → `DECIMAL(15,2)` for monetary values
   - `DateTime` → `TIMESTAMPTZ` (timezone aware)

2. **Primary Keys**:
   - UUID with `uuid_generate_v4()` function
   - Requires `uuid-ossp` extension

3. **Auto-update Timestamps**:
   - Uses triggers instead of SQLAlchemy's `onupdate`
   - Automatic `updated_at` field updates

4. **Foreign Keys**:
   - Added `ON DELETE CASCADE` for referential integrity
   - Better constraint enforcement

5. **Indexes**:
   - Added performance indexes on foreign keys
   - Email index for faster user lookups
   - Transaction date and type indexes

6. **Precision**:
   - DECIMAL(15,2) for monetary values (better precision)
   - VARCHAR with appropriate limits
   - TIMESTAMPTZ for timezone support

## Migration Checklist

- [ ] Backup existing SQLite data
- [ ] Install PostgreSQL
- [ ] Create database and user
- [ ] Run schema creation script
- [ ] Update application connection string
- [ ] Install psycopg2 driver: `pip install psycopg2-binary`
- [ ] Test application connectivity
- [ ] Migrate existing data (if needed)

## Performance Considerations

- All foreign key columns have indexes
- Transaction table has indexes on date and type
- Email field has unique index
- Consider partitioning transaction table by date for large datasets

## Security Notes

- Use strong passwords for database users
- Consider SSL connections for production
- Limit database user permissions as needed
- Regular backups recommended
