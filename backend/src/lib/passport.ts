import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GithubStrategy } from 'passport-github2';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import { Strategy as CustomStrategy } from 'passport-custom';
import prisma from './prisma';
import dotenv from 'dotenv';
import { sendWelcomeEmail } from './mail';

dotenv.config();

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    'google',
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `https://testi-hub-backend.vercel.app/api/auth/google/callback`,
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log('[Passport] Google Auth ID ends in:', process.env.GOOGLE_CLIENT_ID?.slice(-10));
        console.log('[Passport] Google Auth secret ends in:', process.env.GOOGLE_CLIENT_SECRET?.slice(-4));
        try {
          const email = profile.emails?.[0].value;
          if (!email) return done(new Error('No email found from Google'));

          let user = await prisma.user.findUnique({ where: { email } });
          let isNew = false;

          if (user) {
            if (!user.googleId) {
              user = await prisma.user.update({
                where: { id: user.id },
                data: { 
                  googleId: profile.id,
                  avatar: user.avatar || profile.photos?.[0].value,
                  provider: user.password ? 'hybrid' : 'google',
                },
              });
            }
          } else {
            isNew = true;
            user = await prisma.user.create({
              data: {
                email,
                name: profile.displayName,
                googleId: profile.id,
                avatar: profile.photos?.[0].value,
                provider: 'google',
              },
            });
            sendWelcomeEmail(user.email, user.name || undefined);
          }
          return done(null, { ...user, isNew });
        } catch (error) { return done(error as Error); }
      }
    )
  );
} else {
  console.warn('⚠️ Google Auth Keys missing. Using Mock "google" strategy.');
  passport.use('google', new CustomStrategy(async (req, done) => {
    try {
      const email = 'demo_google_user@example.com';
      let user = await prisma.user.findUnique({ where: { email } });
      let isNew = false;
      if (!user) {
        isNew = true;
        user = await prisma.user.create({
          data: { email, name: 'Demo Google User', googleId: 'mock_id', provider: 'google' },
        });
        sendWelcomeEmail(user.email, user.name || undefined);
      }
      return done(null, { ...user, isNew });
    } catch (error) { return done(error as Error); }
  }));
}

// ─── Github Strategy ───────────────────────────────────────────────────────
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use('github', new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `https://testi-hub-backend.vercel.app/api/auth/github/callback`,
      scope: ['user:email'],
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('No email from Github'));
        let user = await prisma.user.findUnique({ where: { email } });
        let isNew = false;
        if (!user) {
          isNew = true;
          user = await prisma.user.create({
            data: { email, name: profile.displayName || profile.username, provider: 'github' }
          });
          sendWelcomeEmail(user.email, user.name || undefined);
        }
        return done(null, { ...user, isNew });
      } catch (error) { return done(error); }
    }
  ));
} else {
  passport.use('github', new CustomStrategy(async (req, done) => {
    try {
      const email = 'demo_github_user@example.com';
      let user = await prisma.user.findUnique({ where: { email } });
      let isNew = false;
      if (!user) {
        isNew = true;
        user = await prisma.user.create({
          data: { email, name: 'Demo Github User', provider: 'github' }
        });
        sendWelcomeEmail(user.email, user.name || undefined);
      }
      return done(null, { ...user, isNew });
    } catch (error) { return done(error); }
  }));
}

// ─── LinkedIn Strategy ─────────────────────────────────────────────────────
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
  passport.use('linkedin', new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: `https://testi-hub-backend.vercel.app/api/auth/linkedin/callback`,
      scope: ['openid', 'profile', 'email'],
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('No email from LinkedIn'));
        let user = await prisma.user.findUnique({ where: { email } });
        let isNew = false;
        if (!user) {
          isNew = true;
          user = await prisma.user.create({
            data: { email, name: profile.displayName, provider: 'linkedin' }
          });
          sendWelcomeEmail(user.email, user.name || undefined);
        }
        return done(null, { ...user, isNew });
      } catch (error) { return done(error); }
    }
  ));
} else {
  passport.use('linkedin', new CustomStrategy(async (req, done) => {
    try {
      const email = 'demo_linkedin_user@example.com';
      let user = await prisma.user.findUnique({ where: { email } });
      let isNew = false;
      if (!user) {
        isNew = true;
        user = await prisma.user.create({
          data: { email, name: 'Demo LinkedIn User', provider: 'linkedin' }
        });
        sendWelcomeEmail(user.email, user.name || undefined);
      }
      return done(null, { ...user, isNew });
    } catch (error) { return done(error); }
  }));
}

// ─── Serialize / Deserialize (required by passport, even with JWT) ──────────

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
