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

  create(data: { id: string; email: string; passwordHash: string; name: string; role?: string }) {
    return db.insert(users).values({
      id: data.id,
      email: data.email,
      passwordHash: data.passwordHash,
      name: data.name,
      role: (data.role as 'admin' | 'manager' | 'dispatcher' | 'viewer') ?? 'viewer',
    }).returning().get()
  },
}
