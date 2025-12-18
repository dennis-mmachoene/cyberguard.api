import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import environment from './environment.js';

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Local Strategy (Email/Password)
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        // Sanitize email
        const sanitizedEmail = email.toLowerCase().trim();
        
        // Find user by email
        const user = await User.findOne({ email: sanitizedEmail });
        
        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }
        
        // Check if user is using OAuth (Google)
        if (user.authProvider === 'google') {
          return done(null, false, { message: 'Please use Google Sign-In for this account' });
        }
        
        // Check if account is locked
        if (user.isLocked) {
          const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
          return done(null, false, { 
            message: `Account locked. Try again in ${remainingTime} minutes` 
          });
        }
        
        // Verify password
        const isMatch = await user.comparePassword(password);
        
        if (!isMatch) {
          // Increment login attempts
          await user.incrementLoginAttempts();
          
          const attemptsLeft = environment.auth.maxLoginAttempts - user.loginAttempts;
          if (attemptsLeft > 0) {
            return done(null, false, { 
              message: `Invalid email or password. ${attemptsLeft} attempts remaining` 
            });
          } else {
            return done(null, false, { 
              message: 'Account locked due to too many failed login attempts' 
            });
          }
        }
        
        // Reset login attempts on successful login
        if (user.loginAttempts > 0) {
          await user.resetLoginAttempts();
        }
        
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: environment.auth.google.clientID,
      clientSecret: environment.auth.google.clientSecret,
      callbackURL: environment.auth.google.callbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Extract user data from Google profile
        const email = profile.emails[0].value.toLowerCase().trim();
        const displayName = profile.displayName;
        const googleId = profile.id;
        
        // Check if user exists
        let user = await User.findOne({ email });
        
        if (user) {
          // User exists - update Google ID if not set
          if (!user.googleId) {
            user.googleId = googleId;
            user.authProvider = 'google';
            await user.save();
          }
          
          // Update last login
          user.lastLogin = new Date();
          await user.save();
          
          return done(null, user);
        }
        
        // Create new user
        user = await User.create({
          email,
          displayName,
          googleId,
          authProvider: 'google',
          isEmailVerified: true,
          lastLogin: new Date(),
        });
        
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;