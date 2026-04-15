import { oauthService, type OauthProvider } from '../../../services/oauthService'
import { apiError } from '../../../utils/errors'

const VALID: OauthProvider[] = ['google', 'microsoft']

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 10, // 10 minutes is plenty to complete the round trip
}

export default defineEventHandler((event) => {
  const provider = getRouterParam(event, 'provider') as OauthProvider | undefined
  if (!provider || !VALID.includes(provider)) {
    throw apiError('validation_error', 'unknown oauth provider', { provider }, event)
  }

  try {
    const { url, state, verifier } = oauthService.buildAuthorizeUrl(provider)
    setCookie(event, `oauth_state_${provider}`, state, COOKIE_OPTS)
    setCookie(event, `oauth_pkce_${provider}`, verifier, COOKIE_OPTS)
    return sendRedirect(event, url, 302)
  } catch (e) {
    throw apiError('upstream_error', (e as Error).message, { provider }, event)
  }
})
