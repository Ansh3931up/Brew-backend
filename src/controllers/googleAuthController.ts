import { Request, Response } from 'express'
import passport from 'passport'
import { sendError } from '../utils/response.js'
import { HTTP_STATUS } from '../utils/constants.js'
import type { IUser } from '../models/User.js'

export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email']
})

export const googleCallback = (req: Request, res: Response): void => {
  passport.authenticate(
    'google',
    { session: false },
    (err: Error | null, user: IUser | false) => {
      if (err || !user) {
        // Redirect to frontend login page with error
        return res.redirect(
          `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/login?error=auth_failed`
        )
      }

      // Generate token
      const token = user.generateToken()

      // Redirect to frontend with token
      const userResponse = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }

      // Store token in query param (frontend will handle it)
      const redirectUrl = new URL(
        `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/auth/callback`
      )
      redirectUrl.searchParams.set('token', token)
      redirectUrl.searchParams.set('user', JSON.stringify(userResponse))

      res.redirect(redirectUrl.toString())
    }
  )(req, res)
}

export const googleAuthInitiate = (_req: Request, res: Response): Response => {
  return sendError(
    res,
    'Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET',
    HTTP_STATUS.NOT_IMPLEMENTED
  )
}

export const googleAuthStatus = (_req: Request, res: Response): Response => {
  const isEnabled = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  return res.status(HTTP_STATUS.OK).json({ enabled: isEnabled })
}
