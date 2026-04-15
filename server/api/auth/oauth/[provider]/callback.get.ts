import { lucia } from '../../../../db/auth'
import { oauthService, type OauthProvider } from '../../../../services/oauthService'
import { accountLinkService } from '../../../../services/accountLinkService'
import { auditService } from '../../../../services/auditService'
import { loggerService as logger } from '../../../../services/loggerService'
import { apiError } from '../../../../utils/errors'

const VALID: OauthProvider[] = ['google', 'microsoft']

export default defineEventHandler(async (event) => {
  const provider = getRouterParam(event, 'provider') as OauthProvider | undefined
  if (!provider || !VALID.includes(provider)) {
    throw apiError('validation_error', 'unknown oauth provider', { provider }, event)
  }

  const query = getQuery(event)
  const code = typeof query.code === 'string' ? query.code : ''
  const returnedState = typeof query.state === 'string' ? query.state : ''

  const expectedState = getCookie(event, `oauth_state_${provider}`)
  const verifier = getCookie(event, `oauth_pkce_${provider}`)

  // clear oauth cookies immediately — one-shot values
  setCookie(event, `oauth_state_${provider}`, '', { maxAge: 0, path: '/' })
  setCookie(event, `oauth_pkce_${provider}`, '', { maxAge: 0, path: '/' })

  if (!code || !returnedState || !expectedState || !verifier) {
    throw apiError('validation_error', 'oauth state missing or expired', undefined, event)
  }
  if (returnedState !== expectedState) {
    throw apiError('forbidden', 'oauth state mismatch', undefined, event)
  }

  try {
    const profile = await oauthService.exchangeCode(provider, code, verifier)
    if (!profile.email) {
      throw apiError('validation_error', 'oauth provider did not return an email', undefined, event)
    }

    const { user, created } = await accountLinkService.resolveOrCreate(provider, profile)

    const session = await lucia.createSession(user.id, {})
    appendResponseHeader(event, 'Set-Cookie', lucia.createSessionCookie(session.id).serialize())

    auditService.log({
      companyId: user.companyId,
      userId: user.id,
      action: created ? 'auth.oauth_register' : 'auth.oauth_login',
      entityType: 'session',
      metadata: { provider },
    })

    return sendRedirect(event, '/dashboard', 302)
  } catch (e) {
    logger.error('oauth callback failed', {
      requestId: event.context.requestId,
      provider,
      error: (e as Error).message,
    })
    throw apiError('upstream_error', 'oauth sign-in failed', { provider }, event)
  }
})
