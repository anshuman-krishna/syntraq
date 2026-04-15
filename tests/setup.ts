// force a fresh isolated sqlite database per test run. individual suites may
// still create their own temp dbs; this default lets simple service tests
// just import the shared client.
import { mkdtempSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

const dir = mkdtempSync(join(tmpdir(), 'syntraq-test-'))
process.env.DATABASE_URL = `file:${join(dir, 'test.sqlite')}`
process.env.AUTH_SECRET = 'test-secret'
process.env.NODE_ENV = 'test'
