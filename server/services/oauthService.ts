import { createHash, randomBytes } from 'crypto'

// minimal oauth2 code-flow helper with pkce.
// one helper per provider is configured below; arctic / lucia oauth can replace
// this later when we add more providers (improvement phase 3 continuation).

export type OauthProvider = 'google' | 'microsoft'

export interface ProviderProfile {
  providerAccountId: string
  email: string
  name: string
  emailVerified?: boolean
}

type UrlResolver = string | (() => string)

interface ProviderConfig {
  authorizeUrl: UrlResolver
  tokenUrl: UrlResolver
  userinfoUrl: string
  scope: string
  clientId: () => string
  clientSecret: () => string
  parseProfile: (raw: Record<string, unknown>) => ProviderProfile
}

function requireEnv(key: string): string {
  const v = process.env[key]
  if (!v) throw new Error(`${key} is not configured`)
  return v
}

const PROVIDERS: Record<OauthProvider, ProviderConfig> = {
  google: {
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userinfoUrl: 'https://openidconnect.googleapis.com/v1/userinfo',
    scope: 'openid email profile',
    clientId: () => requireEnv('OAUTH_GOOGLE_CLIENT_ID'),
    clientSecret: () => requireEnv('OAUTH_GOOGLE_CLIENT_SECRET'),
    parseProfile: (raw) => ({
      providerAccountId: String(raw.sub),
      email: String(raw.email),
      name: String(raw.name ?? raw.email),
      emailVerified: Boolean(raw.email_verified),
    }),
  },
  microsoft: {
    authorizeUrl: () => `https://login.microsoftonline.com/${process.env.OAUTH_MICROSOFT_TENANT || 'common'}/oauth2/v2.0/authorize`,
    tokenUrl: () => `https://login.microsoftonline.com/${process.env.OAUTH_MICROSOFT_TENANT || 'common'}/oauth2/v2.0/token`,
    userinfoUrl: 'https://graph.microsoft.com/oidc/userinfo',
    scope: 'openid email profile offline_access',
    clientId: () => requireEnv('OAUTH_MICROSOFT_CLIENT_ID'),
    clientSecret: () => requireEnv('OAUTH_MICROSOFT_CLIENT_SECRET'),
    parseProfile: (raw) => ({
      providerAccountId: String(raw.sub),
      email: String(raw.email ?? raw.preferred_username),
      name: String(raw.name ?? raw.email ?? raw.preferred_username),
      emailVerified: true,
    }),
  },
}

function b64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function createPkcePair() {
  const verifier = b64url(randomBytes(32))
  const challenge = b64url(createHash('sha256').update(verifier).digest())
  return { verifier, challenge }
}

function resolveUrl(value: UrlResolver): string {
  return typeof value === 'function' ? value() : value
}

function callbackUrl(provider: OauthProvider): string {
  const base = process.env.NUXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return `${base.replace(/\/$/, '')}/api/auth/oauth/${provider}/callback`
}

export const oauthService = {
  buildAuthorizeUrl(provider: OauthProvider) {
    const cfg = PROVIDERS[provider]
    const state = b64url(randomBytes(24))
    const { verifier, challenge } = createPkcePair()

    const params = new URLSearchParams({
      client_id: cfg.clientId(),
      redirect_uri: callbackUrl(provider),
      response_type: 'code',
      scope: cfg.scope,
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
      prompt: 'select_account',
    })

    return {
      url: `${resolveUrl(cfg.authorizeUrl)}?${params.toString()}`,
      state,
      verifier,
    }
  },

  async exchangeCode(provider: OauthProvider, code: string, verifier: string): Promise<ProviderProfile> {
    const cfg = PROVIDERS[provider]

    const tokenRes = await fetch(resolveUrl(cfg.tokenUrl), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: callbackUrl(provider),
        client_id: cfg.clientId(),
        client_secret: cfg.clientSecret(),
        code_verifier: verifier,
      }),
    })

    if (!tokenRes.ok) {
      throw new Error(`${provider} token exchange failed: ${tokenRes.status}`)
    }

    const tokens = await tokenRes.json() as { access_token?: string }
    if (!tokens.access_token) {
      throw new Error(`${provider} token exchange returned no access_token`)
    }

    const userRes = await fetch(cfg.userinfoUrl, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })

    if (!userRes.ok) {
      throw new Error(`${provider} userinfo failed: ${userRes.status}`)
    }

    const raw = await userRes.json() as Record<string, unknown>
    return cfg.parseProfile(raw)
  },
}
