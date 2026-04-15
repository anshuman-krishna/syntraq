import { createHash, randomBytes } from 'crypto'
import { hash as argonHash } from '@node-rs/argon2'
import { generateId } from '../../shared/utils/id'
import { userModel } from '../models/userModel'
import { passwordResetTokenModel } from '../models/passwordResetTokenModel'
import { emailService } from './emailService'
import { AppError } from './authService'

const TOKEN_TTL_MS = 60 * 60 * 1000 // 1 hour
const ARGON2_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
}

function rawToken(): string {
  return randomBytes(32).toString('base64url')
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export const passwordResetService = {
  // always returns the same response shape regardless of email match — avoids enumeration.
  async request(email: string): Promise<{ sent: boolean }> {
    const normalized = email.toLowerCase().trim()
    const user = userModel.findByEmail(normalized)
    if (!user) return { sent: true }

    passwordResetTokenModel.invalidateForUser(user.id)

    const token = rawToken()
    passwordResetTokenModel.create({
      id: generateId(),
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    })

    const base = process.env.NUXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const link = `${base.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`

    await emailService.send({
      to: user.email,
      subject: 'reset your syntraq password',
      body: `hi ${user.name},\n\nsomeone requested a password reset for your account.\nif this was you, open the link below within the next hour.\n${link}\n\nif it wasn't you, ignore this email.\n\n— syntraq`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; color: #333;">
          <h2 style="color: #1a1a2e;">reset your password</h2>
          <p>hi ${user.name},</p>
          <p>someone requested a password reset for your account. if this was you, click below within the next hour.</p>
          <p><a href="${link}" style="display:inline-block;padding:10px 16px;background:#1a1a2e;color:#fff;border-radius:8px;text-decoration:none;">reset password</a></p>
          <p style="color:#888;">if it wasn't you, ignore this email.</p>
        </div>
      `,
    })

    return { sent: true }
  },

  async confirm(token: string, newPassword: string): Promise<{ userId: string }> {
    if (newPassword.length < 8) {
      throw new AppError('password must be at least 8 characters', 400)
    }

    const record = passwordResetTokenModel.findByHash(hashToken(token))
    if (!record) {
      throw new AppError('invalid or expired token', 400)
    }
    if (record.usedAt) {
      throw new AppError('token already used', 400)
    }
    if (record.expiresAt.getTime() < Date.now()) {
      throw new AppError('token expired', 400)
    }

    const passwordHash = await argonHash(newPassword, ARGON2_OPTIONS)
    userModel.updatePasswordHash(record.userId, passwordHash)
    passwordResetTokenModel.markUsed(record.id)

    return { userId: record.userId }
  },
}
