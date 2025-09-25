# 🌐 Guia de Alterações - Website-Hub Integration

## 📋 Overview

Este documento define todas as alterações necessárias no módulo `website-hub` (Next.js) para integrar corretamente com o `automation-hub-core` via GraphQL. O website-hub será o frontend que consome os dados financeiros do automation-hub-core.

---

## 🏗️ Arquitetura Atual vs Nova

### ❌ Antes (Estático)
```
website-hub (Next.js + mock data)
    ↓
Interface estática sem dados reais
```

### ✅ Depois (Integrado)
```
website-hub (Next.js + GraphQL Client)
    ↓ GraphQL Queries
automation-hub-core (Node.js + PostgreSQL)
    ↓ Import from
bank-hub (Python + Banking APIs)
```

---

## 📦 Dependências a Adicionar

### 1. package.json
```json
{
  "dependencies": {
    // Adicionar estas dependências:
    "@apollo/client": "^3.8.0",
    "@apollo/experimental-nextjs-app-support": "^0.5.0",
    "graphql": "^16.8.1",
    "graphql-tag": "^2.12.6",
    "react-hook-form": "^7.48.0",
    "recharts": "^2.8.0",
    "date-fns": "^2.30.0",
    "@tanstack/react-query": "^5.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    // Adicionar estas dependências de desenvolvimento:
    "@graphql-codegen/cli": "^5.0.0",
    "@graphql-codegen/client-preset": "^4.1.0",
    "@graphql-codegen/introspection": "^4.0.0",
    "graphql-codegen": "^0.4.0"
  }
}
```

### 2. Instalar dependências
```bash
pnpm add @apollo/client @apollo/experimental-nextjs-app-support graphql graphql-tag react-hook-form recharts date-fns @tanstack/react-query zod

pnpm add -D @graphql-codegen/cli @graphql-codegen/client-preset @graphql-codegen/introspection
```

---

## 🆕 Novos Arquivos a Criar

### 1. `lib/apollo-client.ts`
```typescript
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
})

const authLink = setContext((_, { headers }) => {
  // Get authentication token from localStorage (if needed)
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
})

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      User: {
        fields: {
          banks: {
            merge(existing = [], incoming) {
              return incoming
            }
          }
        }
      },
      Transaction: {
        fields: {
          transactionDate: {
            read(value) {
              return value ? new Date(value) : null
            }
          }
        }
      }
    }
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'ignore',
    },
    query: {
      errorPolicy: 'all',
    },
  },
})
```

### 2. `lib/apollo-wrapper.tsx`
```typescript
"use client"

import { ApolloNextAppProvider } from "@apollo/experimental-nextjs-app-support/ssr"
import { apolloClient } from "./apollo-client"

export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={() => apolloClient}>
      {children}
    </ApolloNextAppProvider>
  )
}
```

### 3. `lib/graphql/queries.ts`
```typescript
import { gql } from '@apollo/client'

// ============ USER QUERIES ============

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
      phoneNumber
      createdAt
      updatedAt
    }
  }
`

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
      phoneNumber
      createdAt
      updatedAt
    }
  }
`

// ============ BANK QUERIES ============

export const GET_BANKS = gql`
  query GetBanks {
    banks {
      id
      name
      userId
      createdAt
      updatedAt
    }
  }
`

export const GET_BANKS_BY_USER = gql`
  query GetBanksByUser($userId: ID!) {
    banksByUserId(userId: $userId) {
      id
      name
      userId
      createdAt
      updatedAt
    }
  }
`

export const GET_BANK_ACCOUNTS = gql`
  query GetBankAccounts($bankId: ID!) {
    bankAccounts(bankId: $bankId) {
      id
      bankId
      userId
      accountId
      type
      balance
      currencyCode
      createdAt
      updatedAt
    }
  }
`

// ============ TRANSACTION QUERIES ============

export const GET_TRANSACTIONS = gql`
  query GetTransactions {
    transactions {
      id
      bankId
      type
      amount
      currency
      description
      transactionDate
      createdAt
      updatedAt
    }
  }
`

export const GET_TRANSACTIONS_BY_USER = gql`
  query GetTransactionsByUser($userId: ID!) {
    transactionsByUserId(userId: $userId) {
      id
      bankId
      type
      amount
      currency
      description
      transactionDate
      createdAt
      updatedAt
    }
  }
`

export const GET_TRANSACTIONS_BY_BANK = gql`
  query GetTransactionsByBank($bankId: ID!) {
    transactionsByBankId(bankId: $bankId) {
      id
      bankId
      type
      amount
      currency
      description
      transactionDate
      createdAt
      updatedAt
    }
  }
`

export const GET_TRANSACTIONS_BY_DATE_RANGE = gql`
  query GetTransactionsByDateRange($startDate: Date!, $endDate: Date!) {
    transactionsByDateRange(startDate: $startDate, endDate: $endDate) {
      id
      bankId
      type
      amount
      currency
      description
      transactionDate
      createdAt
      updatedAt
    }
  }
`

// ============ FINANCIAL OVERVIEW QUERIES ============

export const GET_FINANCIAL_OVERVIEW = gql`
  query GetFinancialOverview($userId: ID!) {
    user(id: $userId) {
      id
      name
      email
    }
    
    banksByUserId(userId: $userId) {
      id
      name
      userId
    }
    
    transactionsByUserId(userId: $userId) {
      id
      type
      amount
      currency
      description
      transactionDate
      bankId
    }
  }
`

// ============ DASHBOARD QUERIES ============

export const GET_DASHBOARD_DATA = gql`
  query GetDashboardData($userId: ID!) {
    user(id: $userId) {
      id
      name
      email
    }
    
    banksByUserId(userId: $userId) {
      id
      name
    }
    
    transactionsByUserId(userId: $userId) {
      id
      type
      amount
      currency
      description
      transactionDate
      createdAt
    }
  }
`
```

### 4. `lib/graphql/mutations.ts`
```typescript
import { gql } from '@apollo/client'

// ============ AUTH MUTATIONS ============

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      success
      message
      token
      user {
        id
        name
        email
      }
    }
  }
`

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      success
      message
      token
      user {
        id
        name
        email
      }
    }
  }
`

// ============ USER MUTATIONS ============

export const CREATE_USER_MUTATION = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
      phoneNumber
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
      email
      phoneNumber
      updatedAt
    }
  }
`

// ============ BANK MUTATIONS ============

export const CREATE_BANK_MUTATION = gql`
  mutation CreateBank($input: CreateBankInput!) {
    createBank(input: $input) {
      id
      name
      userId
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_BANK_MUTATION = gql`
  mutation UpdateBank($id: ID!, $input: UpdateBankInput!) {
    updateBank(id: $id, input: $input) {
      id
      name
      updatedAt
    }
  }
`

export const DELETE_BANK_MUTATION = gql`
  mutation DeleteBank($id: ID!) {
    deleteBank(id: $id)
  }
`

// ============ TRANSACTION MUTATIONS ============

export const CREATE_TRANSACTION_MUTATION = gql`
  mutation CreateTransaction($input: CreateTransactionInput!) {
    createTransaction(input: $input) {
      id
      bankId
      type
      amount
      currency
      description
      transactionDate
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_TRANSACTION_MUTATION = gql`
  mutation UpdateTransaction($id: ID!, $input: UpdateTransactionInput!) {
    updateTransaction(id: $id, input: $input) {
      id
      type
      amount
      currency
      description
      transactionDate
      updatedAt
    }
  }
`

export const DELETE_TRANSACTION_MUTATION = gql`
  mutation DeleteTransaction($id: ID!) {
    deleteTransaction(id: $id)
  }
`
```

### 5. `hooks/use-financial-data.ts`
```typescript
import { useQuery, useMutation } from '@apollo/client'
import { 
  GET_FINANCIAL_OVERVIEW, 
  GET_TRANSACTIONS_BY_USER, 
  GET_BANKS_BY_USER,
  CREATE_TRANSACTION_MUTATION 
} from '@/lib/graphql/queries'
import { useMemo } from 'react'

export function useFinancialOverview(userId: string) {
  const { data, loading, error, refetch } = useQuery(GET_FINANCIAL_OVERVIEW, {
    variables: { userId },
    skip: !userId,
  })

  return {
    user: data?.user,
    banks: data?.banksByUserId || [],
    transactions: data?.transactionsByUserId || [],
    loading,
    error,
    refetch
  }
}

export function useTransactionsByUser(userId: string) {
  const { data, loading, error, refetch } = useQuery(GET_TRANSACTIONS_BY_USER, {
    variables: { userId },
    skip: !userId,
  })

  const transactions = useMemo(() => {
    return data?.transactionsByUserId || []
  }, [data])

  const analytics = useMemo(() => {
    if (!transactions.length) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        transactionCount: 0
      }
    }

    const income = transactions
      .filter((tx: any) => tx.type === 'CREDIT')
      .reduce((sum: number, tx: any) => sum + (Number(tx.amount) || 0), 0)

    const expenses = transactions
      .filter((tx: any) => tx.type === 'DEBIT')
      .reduce((sum: number, tx: any) => sum + Math.abs(Number(tx.amount) || 0), 0)

    return {
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
      transactionCount: transactions.length
    }
  }, [transactions])

  return {
    transactions,
    analytics,
    loading,
    error,
    refetch
  }
}

export function useBanksByUser(userId: string) {
  const { data, loading, error, refetch } = useQuery(GET_BANKS_BY_USER, {
    variables: { userId },
    skip: !userId,
  })

  return {
    banks: data?.banksByUserId || [],
    loading,
    error,
    refetch
  }
}

export function useCreateTransaction() {
  const [createTransaction, { loading, error }] = useMutation(CREATE_TRANSACTION_MUTATION, {
    refetchQueries: [GET_TRANSACTIONS_BY_USER, GET_FINANCIAL_OVERVIEW],
  })

  return {
    createTransaction,
    loading,
    error
  }
}
```

### 6. `hooks/use-auth.ts`
```typescript
import { useQuery, useMutation } from '@apollo/client'
import { LOGIN_MUTATION, REGISTER_MUTATION } from '@/lib/graphql/mutations'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  email: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  const [loginMutation, { loading: loginLoading }] = useMutation(LOGIN_MUTATION)
  const [registerMutation, { loading: registerLoading }] = useMutation(REGISTER_MUTATION)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('auth-token')
    const userStr = localStorage.getItem('user')
    
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr)
        setUser(userData)
        setIsAuthenticated(true)
      } catch (error) {
        localStorage.removeItem('auth-token')
        localStorage.removeItem('user')
      }
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const { data } = await loginMutation({
        variables: { email, password }
      })

      if (data?.login?.success && data?.login?.token) {
        const { token, user: userData } = data.login
        
        localStorage.setItem('auth-token', token)
        localStorage.setItem('user', JSON.stringify(userData))
        
        setUser(userData)
        setIsAuthenticated(true)
        
        router.push('/dashboard')
        return { success: true }
      } else {
        return { 
          success: false, 
          message: data?.login?.message || 'Login failed' 
        }
      }
    } catch (error) {
      return { 
        success: false, 
        message: 'Network error' 
      }
    }
  }

  const register = async (input: { name: string; email: string; password: string }) => {
    try {
      const { data } = await registerMutation({
        variables: { input }
      })

      if (data?.register?.success && data?.register?.token) {
        const { token, user: userData } = data.register
        
        localStorage.setItem('auth-token', token)
        localStorage.setItem('user', JSON.stringify(userData))
        
        setUser(userData)
        setIsAuthenticated(true)
        
        router.push('/dashboard')
        return { success: true }
      } else {
        return { 
          success: false, 
          message: data?.register?.message || 'Registration failed' 
        }
      }
    } catch (error) {
      return { 
        success: false, 
        message: 'Network error' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('auth-token')
    localStorage.removeItem('user')
    setUser(null)
    setIsAuthenticated(false)
    router.push('/login')
  }

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    loginLoading,
    registerLoading
  }
}
```

### 7. `components/providers/apollo-provider.tsx`
```typescript
"use client"

import { ApolloWrapper } from "@/lib/apollo-wrapper"

export function ApolloProvider({ children }: { children: React.ReactNode }) {
  return <ApolloWrapper>{children}</ApolloWrapper>
}
```

### 8. `components/financial/financial-overview.tsx`
```typescript
"use client"

import { useFinancialOverview } from '@/hooks/use-financial-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'

interface FinancialOverviewProps {
  userId: string
}

export function FinancialOverview({ userId }: FinancialOverviewProps) {
  const { user, banks, transactions, loading, error } = useFinancialOverview(userId)

  if (loading) {
    return <FinancialOverviewSkeleton />
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">Erro ao carregar dados financeiros</p>
        </CardContent>
      </Card>
    )
  }

  const totalIncome = transactions
    .filter((tx: any) => tx.type === 'CREDIT')
    .reduce((sum: number, tx: any) => sum + (Number(tx.amount) || 0), 0)

  const totalExpenses = transactions
    .filter((tx: any) => tx.type === 'DEBIT')
    .reduce((sum: number, tx: any) => sum + Math.abs(Number(tx.amount) || 0), 0)

  const balance = totalIncome - totalExpenses

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M12 2v20m-6-6l6 6 6-6" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
          <p className="text-xs text-muted-foreground">
            {balance >= 0 ? '+' : ''}{((balance / (totalIncome || 1)) * 100).toFixed(1)}% do total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receitas</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="m3 17 6-6 4 4 8-8" />
            <path d="m14 5 7 0 0 7" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
          <p className="text-xs text-muted-foreground">
            {transactions.filter((tx: any) => tx.type === 'CREDIT').length} transações
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Despesas</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M16 8v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2m8 0V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2m8 0h2a2 2 0 0 1 2 2v2" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
          <p className="text-xs text-muted-foreground">
            {transactions.filter((tx: any) => tx.type === 'DEBIT').length} transações
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bancos</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M2 20h20" />
            <path d="m4 20 8-16 8 16" />
            <path d="M8 20v-6h8v6" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{banks.length}</div>
          <p className="text-xs text-muted-foreground">
            {transactions.length} transações totais
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function FinancialOverviewSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-[120px] mb-2" />
            <Skeleton className="h-3 w-[80px]" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

### 9. `components/transactions/transaction-list.tsx`
```typescript
"use client"

import { useTransactionsByUser } from '@/hooks/use-financial-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatDate } from '@/lib/utils'

interface TransactionListProps {
  userId: string
}

export function TransactionList({ userId }: TransactionListProps) {
  const { transactions, loading, error } = useTransactionsByUser(userId)

  if (loading) {
    return <TransactionListSkeleton />
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">Erro ao carregar transações</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.slice(0, 10).map((transaction: any) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-2 h-2 rounded-full ${
                  transaction.type === 'CREDIT' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <div>
                  <p className="font-medium">{transaction.description || 'Sem descrição'}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(transaction.transactionDate)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${
                  transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'CREDIT' ? '+' : '-'}
                  {formatCurrency(Math.abs(Number(transaction.amount) || 0))}
                </p>
                <Badge variant={transaction.type === 'CREDIT' ? 'default' : 'destructive'}>
                  {transaction.type === 'CREDIT' ? 'Receita' : 'Despesa'}
                </Badge>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma transação encontrada
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function TransactionListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-[160px]" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <Skeleton className="w-2 h-2 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-[200px] mb-2" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
              </div>
              <div className="text-right">
                <Skeleton className="h-4 w-[80px] mb-2" />
                <Skeleton className="h-5 w-[60px]" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

### 10. `lib/utils.ts` - Adicionar funções de formatação
```typescript
// Adicionar essas funções ao arquivo utils.ts existente

export function formatCurrency(value: number, currency: string = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
  }).format(value)
}

export function formatDate(date: string | Date): string {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateObj)
}

export function formatDateTime(date: string | Date): string {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj)
}
```

---

## ✏️ Arquivos a Modificar

### 1. `app/layout.tsx` - Adicionar Apollo Provider
```tsx
import { ApolloProvider } from '@/components/providers/apollo-provider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <ApolloProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </ApolloProvider>
      </body>
    </html>
  )
}
```

### 2. `app/dashboard/page.tsx` - Integrar dados reais
```tsx
"use client"

import { useAuth } from '@/hooks/use-auth'
import { FinancialOverview } from '@/components/financial/financial-overview'
import { TransactionList } from '@/components/transactions/transaction-list'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || !user) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Bem-vindo, {user.name}! Aqui está sua visão geral financeira.
        </p>
      </div>
      
      <FinancialOverview userId={user.id} />
      
      <div className="grid gap-6 lg:grid-cols-2">
        <TransactionList userId={user.id} />
        {/* Outros componentes do dashboard */}
      </div>
    </div>
  )
}
```

### 3. `app/transactions/page.tsx` - Página de transações
```tsx
"use client"

import { useAuth } from '@/hooks/use-auth'
import { useTransactionsByUser } from '@/hooks/use-financial-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { ColumnDef } from "@tanstack/react-table"

interface Transaction {
  id: string
  type: string
  amount: number
  description: string
  transactionDate: string
  currency: string
}

const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "transactionDate",
    header: "Data",
    cell: ({ row }) => formatDateTime(row.getValue("transactionDate")),
  },
  {
    accessorKey: "description",
    header: "Descrição",
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      return (
        <Badge variant={type === 'CREDIT' ? 'default' : 'destructive'}>
          {type === 'CREDIT' ? 'Receita' : 'Despesa'}
        </Badge>
      )
    },
  },
  {
    accessorKey: "amount",
    header: "Valor",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))
      const type = row.original.type
      return (
        <div className={`font-medium ${type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
          {type === 'CREDIT' ? '+' : '-'}{formatCurrency(Math.abs(amount))}
        </div>
      )
    },
  },
]

export default function TransactionsPage() {
  const { user, isAuthenticated } = useAuth()
  const { transactions, analytics, loading, error } = useTransactionsByUser(user?.id || '')

  if (!isAuthenticated) {
    return <div>Acesso negado</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Transações</h2>
        <p className="text-muted-foreground">
          Gerencie e visualize todas as suas transações financeiras.
        </p>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Transações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.transactionCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(analytics.totalIncome)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(analytics.totalExpenses)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${analytics.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(analytics.balance)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Transações</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Carregando...</div>
          ) : error ? (
            <div className="text-red-500">Erro ao carregar transações</div>
          ) : (
            <DataTable columns={columns} data={transactions} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

### 4. `.env.local` - Configurações de ambiente
```env
# GraphQL API
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql

# App Settings
NEXT_PUBLIC_APP_NAME=Automation Hub
NEXT_PUBLIC_APP_VERSION=1.0.0

# Development
NEXT_PUBLIC_DEV_MODE=true
```

---

## 🔧 Scripts de Configuração

### 1. `codegen.ts` - GraphQL Code Generation
```typescript
import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  overwrite: true,
  schema: "http://localhost:4000/graphql",
  documents: "lib/graphql/**/*.ts",
  generates: {
    "lib/graphql/generated.ts": {
      plugins: ["typescript", "typescript-operations", "typescript-react-apollo"],
      config: {
        withHooks: true,
        withComponent: false,
        withHOC: false
      }
    },
    "./graphql.schema.json": {
      plugins: ["introspection"]
    }
  }
}

export default config
```

### 2. `scripts/generate-types.js`
```javascript
const { execSync } = require('child_process')

console.log('🔄 Generating GraphQL types...')

try {
  // Generate types from GraphQL schema
  execSync('npx graphql-codegen --config codegen.ts', { stdio: 'inherit' })
  console.log('✅ GraphQL types generated successfully!')
} catch (error) {
  console.error('❌ Failed to generate GraphQL types:', error.message)
  process.exit(1)
}
```

### 3. `package.json` - Adicionar scripts
```json
{
  "scripts": {
    // Adicionar estes scripts:
    "generate": "graphql-codegen --config codegen.ts",
    "generate:watch": "graphql-codegen --config codegen.ts --watch",
    "type-check": "tsc --noEmit",
    "test:graphql": "node scripts/test-graphql-connection.js"
  }
}
```

---

## 📋 Checklist de Implementação

### ✅ Preparação
- [ ] Instalar dependências GraphQL: `pnpm add @apollo/client graphql`
- [ ] Verificar se automation-hub-core está rodando em localhost:4000
- [ ] Configurar variáveis de ambiente

### ✅ Implementação Core
- [ ] Criar `lib/apollo-client.ts`
- [ ] Criar `lib/apollo-wrapper.tsx`
- [ ] Criar `lib/graphql/queries.ts`
- [ ] Criar `lib/graphql/mutations.ts`
- [ ] Criar `hooks/use-financial-data.ts`
- [ ] Criar `hooks/use-auth.ts`

### ✅ Componentes
- [ ] Criar `components/financial/financial-overview.tsx`
- [ ] Criar `components/transactions/transaction-list.tsx`
- [ ] Atualizar `components/providers/apollo-provider.tsx`

### ✅ Páginas
- [ ] Atualizar `app/layout.tsx` com ApolloProvider
- [ ] Atualizar `app/dashboard/page.tsx` com dados reais
- [ ] Atualizar `app/transactions/page.tsx` com dados reais
- [ ] Atualizar `app/banks/page.tsx` com dados reais

### ✅ Utilitários
- [ ] Adicionar funções de formatação em `lib/utils.ts`
- [ ] Configurar `.env.local`
- [ ] Configurar `codegen.ts` para geração de tipos

### ✅ Testes
- [ ] Testar conexão GraphQL
- [ ] Testar queries de dashboard
- [ ] Testar mutations de autenticação
- [ ] Testar responsividade

---

## 🚀 Comandos de Uso

### Após implementação:

```bash
# Instalar dependências
pnpm install

# Gerar tipos GraphQL
pnpm run generate

# Iniciar desenvolvimento
pnpm dev

# Testar build
pnpm build

# Type checking
pnpm type-check
```

---

## 🎯 Resultado Final

Após implementar essas alterações, o website-hub terá:

1. **🔗 Conexão GraphQL** com automation-hub-core
2. **📊 Dashboard em tempo real** com dados financeiros
3. **📈 Analytics financeiros** calculados dinamicamente
4. **🔐 Sistema de autenticação** integrado
5. **📱 Interface responsiva** com dados reais
6. **⚡ Performance otimizada** com cache Apollo
7. **🛡️ Type safety** com TypeScript e GraphQL

### 🔄 Fluxo de Dados Final:
```
bank-hub → automation-hub-core → website-hub
(fetch)      (persist)             (display)
```

O website-hub se tornará uma **interface moderna e funcional** que consome dados reais do sistema bancário integrado! 🚀

Quer que eu ajude com alguma parte específica da implementação do frontend? 🤔
