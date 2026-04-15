import { hash, verify } from '@node-rs/argon2'
import { generateId } from '../../shared/utils/id'
import { userModel } from '../models/userModel'
import { companyModel } from '../models/companyModel'
import type { RegisterInput, LoginInput } from '../../shared/utils/validation'

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

const ARGON2_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = userModel.findByEmail(input.email)
    if (existing) {
      throw new AppError('email already registered', 409)
    }

    const passwordHash = await hash(input.password, ARGON2_OPTIONS)

    // first user in a new company = admin
    const company = companyModel.create({
      id: generateId(),
      name: input.companyName,
    })

    const user = userModel.create({
      id: generateId(),
      email: input.email,
      passwordHash,
      name: input.name,
      role: 'admin',
      companyId: company.id,
    })

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: company.id,
      companyName: company.name,
    }
  },

  async login(input: LoginInput) {
    const user = userModel.findByEmail(input.email)
    if (!user || !user.passwordHash) {
      throw new AppError('invalid email or password', 401)
    }

    const valid = await verify(user.passwordHash, input.password, ARGON2_OPTIONS)
    if (!valid) {
      throw new AppError('invalid email or password', 401)
    }

    const company = companyModel.findById(user.companyId)

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId,
      companyName: company?.name ?? '',
    }
  },
}
