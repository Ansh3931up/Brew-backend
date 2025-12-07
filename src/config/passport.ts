import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import User from '../models/User.js'
import env from './env.js'
import type { IUser } from '../models/User.js'

// JWT Strategy for token verification
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: env.JWT_SECRET
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload.id).select('-password')
        if (user) {
          return done(null, user)
        }
        return done(null, false)
      } catch (error) {
        return done(error, false)
      }
    }
  )
)

// Google OAuth Strategy
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          // Check if user exists with this Google ID
          let user = await User.findOne({ googleId: profile.id })

          if (user) {
            return done(null, user)
          }

          // Check if user exists with this email
          user = await User.findOne({ email: profile.emails?.[0]?.value?.toLowerCase() })

          if (user) {
            // Link Google account to existing user
            user.googleId = profile.id
            await user.save()
            return done(null, user)
          }

          // Create new user
          user = await User.create({
            name: profile.displayName || profile.name?.givenName || 'User',
            email: profile.emails?.[0]?.value?.toLowerCase() || '',
            googleId: profile.id
          })

          return done(null, user)
        } catch (error) {
          return done(error, undefined)
        }
      }
    )
  )
}

// Serialize user for session (not used with JWT, but required by Passport)
passport.serializeUser((user: IUser, done) => {
  done(null, user._id)
})

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id).select('-password')
    done(null, user || undefined)
  } catch (error) {
    done(error, undefined)
  }
})

export default passport
