import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import * as phoneAuthController from '../controllers/phoneAuth.controller';
import { protect } from '../middlewares/auth.middleware';
import passport from 'passport';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/set-password', authController.setPassword);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refreshToken);
router.get('/me', protect, authController.getMe);
router.put('/update-profile', protect, authController.updateProfile);
router.post('/change-password', protect, authController.changePassword);

// ─── Google OAuth ────────────────────────────────────────────────────────────

// Sign IN: Only show account chooser (no consent screen)
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account', session: false }),
  authController.googleCallback
);

// Sign UP: Show account chooser AND consent/permissions screen
router.get('/google/signup',
  passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account consent', session: false }),
  authController.googleCallback
);

// Shared callback for both sign-in and sign-up flows
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed`, session: false }),
  authController.googleCallback
);

// ─── Github OAuth ────────────────────────────────────────────────────────────
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'], session: false }),
  authController.oauthCallback
);
router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed`, session: false }),
  authController.oauthCallback
);

// ─── Phone OTP routes ────────────────────────────────────────────────────────
router.post('/phone/request', phoneAuthController.requestOtp);
router.post('/phone/verify', phoneAuthController.verifyOtp);

export default router;
