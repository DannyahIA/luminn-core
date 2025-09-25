import { Resolver, Mutation, Arg, Ctx } from 'type-graphql'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { AuthResponse, LoginResponse, RegisterInput, LoginInput } from '../types'
import { Context } from '../types/context'
import { convertUser } from '../utils/converters'

@Resolver()
export class AuthResolver {
  @Mutation(() => AuthResponse)
  async register(
    @Arg('input', () => RegisterInput) { name, email, password, phoneNumber }: RegisterInput,
    @Ctx() ctx: Context
  ): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await ctx.prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      throw new Error('User already exists')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await ctx.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phoneNumber
      }
    })

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    return {
      token,
      user: convertUser(user)
    }
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg('input', () => LoginInput) { email, password }: LoginInput,
    @Ctx() ctx: Context
  ): Promise<LoginResponse> {
    // Find user
    const user = await ctx.prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      throw new Error('Invalid credentials')
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      throw new Error('Invalid credentials')
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    return {
      token,
      user: convertUser(user)
    }
  }
}
