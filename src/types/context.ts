import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'

export interface Context {
  prisma: PrismaClient
  req: Request
  res: Response
  userId?: string
}

export interface JWTPayload {
  userId: string
  email: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}
