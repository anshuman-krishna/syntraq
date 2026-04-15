import { eq } from 'drizzle-orm'
import { db } from '../db/client'
import { users } from '../db/schema'

export const userModel = {
  findById(id: string) {
    return db.select().from(users).where(eq(users.id, id)).get()
  },

  findByEmail(email: string) {
    return db.select().from(users).where(eq(users.email, email)).get()
  },

  create(data: {
    id: string
    email: string
    passwordHash: string | null
    name: string
    role: 'admin' | 'manager' | 'operator'
    companyId: string
  }) {
    return db.insert(users).values(data).returning().get()
  },

  updatePasswordHash(id: string, passwordHash: string) {
    return db.update(users)
      .set({ passwordHash })
      .where(eq(users.id, id))
      .run()
  },
}
