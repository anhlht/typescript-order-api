import passport = require('passport')
import { Strategy } from 'passport-jwt'
import { ExtractJwt, StrategyOptions, VerifiedCallback } from 'passport-jwt'

export class PassportConfiguration {
    constructor() {
        passport.use(
            new Strategy(
                {
                    secretOrKey: 'top_secret',
                    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
                },
                async (token: any, done: VerifiedCallback) => {
                    try {
                        return done(null, token.user)
                    } catch (error) {
                        done(error)
                    }
                }
            ))
    }
}
