import { generateId } from '../../shared/utils/id'
import { userModel } from '../models/userModel'
import { companyModel } from '../models/companyModel'
import { oauthAccountModel, type OauthProvider } from '../models/oauthAccountModel'
import type { ProviderProfile } from './oauthService'

// given an oauth profile, resolve to a user record.
// priority: existing oauth link > existing local user with same email > new user + new company.
export const accountLinkService = {
  async resolveOrCreate(provider: OauthProvider, profile: ProviderProfile) {
    const linked = oauthAccountModel.findByProvider(provider, profile.providerAccountId)
    if (linked) {
      const user = userModel.findById(linked.userId)
      if (user) return { user, linked: true, created: false }
    }

    const existing = userModel.findByEmail(profile.email.toLowerCase())
    if (existing) {
      oauthAccountModel.create({
        id: generateId(),
        userId: existing.id,
        provider,
        providerAccountId: profile.providerAccountId,
        email: profile.email,
      })
      return { user: existing, linked: true, created: false }
    }

    // brand new — create a fresh company alongside the user (same shape as register)
    const company = companyModel.create({
      id: generateId(),
      name: `${profile.name}'s company`,
    })

    const created = userModel.create({
      id: generateId(),
      email: profile.email.toLowerCase(),
      passwordHash: null,
      name: profile.name,
      role: 'admin',
      companyId: company.id,
    })

    oauthAccountModel.create({
      id: generateId(),
      userId: created.id,
      provider,
      providerAccountId: profile.providerAccountId,
      email: profile.email,
    })

    return { user: created, linked: true, created: true }
  },

  list(userId: string) {
    return oauthAccountModel.findByUser(userId).map(a => ({
      id: a.id,
      provider: a.provider,
      email: a.email,
      createdAt: a.createdAt,
    }))
  },

  unlink(id: string, userId: string) {
    return oauthAccountModel.remove(id, userId)
  },
}
