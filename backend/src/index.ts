import 'reflect-metadata'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import express from 'express'
import http from 'http'
import cors from 'cors'
import dotenv from 'dotenv'
import { buildSchema } from 'type-graphql'
import { prisma } from './db/prisma'
import { Context } from './types/context'

// Resolvers
import { UserResolver } from './resolvers/UserResolver'
import { BankResolver } from './resolvers/BankResolver'
import { TransactionResolver } from './resolvers/TransactionResolver'
import { AuthResolver } from './resolvers/AuthResolver'
// import { ImportResolver } from './resolvers/ImportResolver'

// Load environment variables
dotenv.config()

async function startServer() {
  try {
    // Create Express app
    const app = express()
    const httpServer = http.createServer(app)

    // Build GraphQL schema
    const schema = await buildSchema({
      resolvers: [
        UserResolver,
        BankResolver, 
        TransactionResolver,
        AuthResolver,
        // ImportResolver
      ],
      validate: false,
    })

    // Create Apollo Server
    const server = new ApolloServer<Context>({
      schema,
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
      introspection: process.env.NODE_ENV !== 'production',
    })

    // Start Apollo Server
    await server.start()

    // Apply middleware
    app.use(
      '/graphql',
      cors<cors.CorsRequest>({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
      }),
      express.json({ limit: '50mb' }),
      expressMiddleware(server, {
        context: async ({ req, res }) => ({
          prisma,
          req,
          res,
        }),
      })
    )

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({ 
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        service: 'automation-hub-backend'
      })
    })

    // Start server
    const PORT = process.env.PORT || 4000
    await new Promise<void>((resolve) => 
      httpServer.listen({ port: PORT }, resolve)
    )

    console.log('🚀 Automation Hub Backend Server Ready!')
    console.log(`📊 GraphQL endpoint: http://localhost:${PORT}/graphql`)
    console.log(`🏥 Health check: http://localhost:${PORT}/health`)
    console.log(`🌐 GraphQL Playground: http://localhost:${PORT}/graphql`)
    
    // Database connection test
    await prisma.$connect()
    console.log('✅ Database connected successfully')

  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down server...')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down server...')
  await prisma.$disconnect()
  process.exit(0)
})

startServer().catch((error) => {
  console.error('💥 Server startup failed:', error)
  process.exit(1)
})
