import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { z } from 'zod';
import { sendWelcomeEmail } from '../lib/mail';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

const generateTokens = (userId: string, sessionVersion: number) => {
  const accessToken = jwt.sign({ userId, sessionVersion }, process.env.JWT_ACCESS_SECRET!, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId, sessionVersion }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email: rawEmail, password, name } = registerSchema.parse(req.body);
    const email = rawEmail.toLowerCase();

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ 
        message: 'This email is already registered. Please sign in.',
        error: 'USER_ALREADY_EXISTS'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // Send welcome email asynchronously
    sendWelcomeEmail(user.email, user.name || undefined);

    const { accessToken, refreshToken } = generateTokens(user.id, user.sessionVersion);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name,
        avatar: user.avatar,
        businessName: user.businessName,
        businessType: user.businessType,
        websiteUrl: user.websiteUrl,
        instagramUrl: user.instagramUrl,
        facebookUrl: user.facebookUrl,
        linkedinUrl: user.linkedinUrl
      },
      accessToken,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email: rawEmail, password } = req.body;
    const email = rawEmail?.toLowerCase();
    
    console.log(`[Login] Attempt for email: ${email}`);

    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      console.log(`[Login] User not found for email: ${email}`);
      return res.status(401).json({ 
        message: 'Account not found. Please sign up to get started.',
        error: 'USER_NOT_FOUND' 
      });
    }

    // Check if user exists and was created via Google but has no password
    if (!user.password && (user.provider === 'google' || user.googleId)) {
      console.log(`[Login] Google user with no password: ${email}`);
      return res.status(400).json({ 
        error: 'GOOGLE_ACCOUNT_NO_PASSWORD',
        message: 'This account was created using Google. Please set a password to continue.' 
      });
    }

    if (!user.password) {
      console.log(`[Login] User has no password set: ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(`[Login] Password valid for ${email}: ${isPasswordValid}`);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Increment session version on new login
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { sessionVersion: { increment: 1 } }
    });

    const { accessToken, refreshToken } = generateTokens(updatedUser.id, updatedUser.sessionVersion);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: { 
        id: user.id, 
        email: user.email, 
        phone: user.phone,
        name: user.name,
        avatar: user.avatar,
        businessName: user.businessName,
        businessType: user.businessType,
        websiteUrl: user.websiteUrl,
        instagramUrl: user.instagramUrl,
        facebookUrl: user.facebookUrl,
        linkedinUrl: user.linkedinUrl
      },
      accessToken,
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
};

export const setPassword = async (req: Request, res: Response) => {
  try {
    const { email: rawEmail, newPassword } = req.body;

    if (!rawEmail || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Valid email and password (min 6 chars) required' });
    }

    const email = rawEmail.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        provider: 'hybrid', // Link Google and local auth
        sessionVersion: { increment: 1 }
      },
    });

    const { accessToken, refreshToken } = generateTokens(updatedUser.id, updatedUser.sessionVersion);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Password set successfully',
      user: { 
        id: updatedUser.id, 
        email: updatedUser.email, 
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        businessName: updatedUser.businessName,
        businessType: updatedUser.businessType,
        websiteUrl: updatedUser.websiteUrl,
        instagramUrl: updatedUser.instagramUrl,
        facebookUrl: updatedUser.facebookUrl,
        linkedinUrl: updatedUser.linkedinUrl
      },
      accessToken,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to set password' });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
};

export const refreshToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string; sessionVersion: number };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Single Session Enforcement: Check if refresh token version matches DB version
    if (user.sessionVersion !== decoded.sessionVersion) {
      res.clearCookie('refreshToken');
      return res.status(401).json({ 
        message: 'Session invalidated. Another login detected.',
        error: 'SESSION_REVOKED'
      });
    }

    const tokens = generateTokens(user.id, user.sessionVersion);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken: tokens.accessToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  res.json({ user: req.user });
};

export const googleCallback = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const authMode = req.cookies.auth_mode; // Read the mode from frontend
    if (!user) {
      return res.redirect(`https://testi-hub-frontend.vercel.app/login?error=auth_failed`);
    }

    // Smart switching for Google
    if (authMode === 'signup' && !user.isNew) {
      return res.redirect(`https://testi-hub-frontend.vercel.app/login?error=USER_ALREADY_EXISTS`);
    }
    if (authMode === 'login' && user.isNew) {
      return res.redirect(`https://testi-hub-frontend.vercel.app/login?error=USER_NOT_FOUND`);
    }

    // Increment session version for Social Login
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { sessionVersion: { increment: 1 } }
    });

    const { accessToken, refreshToken } = generateTokens(updatedUser.id, updatedUser.sessionVersion);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`https://testi-hub-frontend.vercel.app/login?token=${accessToken}`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`https://testi-hub-frontend.vercel.app/login?error=server_error`);
  }
};

// Reusable callback for Github & LinkedIn — same smart switching flow
export const oauthCallback = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const authMode = req.cookies.auth_mode;

    if (!user) {
      return res.redirect(`https://testi-hub-frontend.vercel.app/login?error=auth_failed`);
    }

    // Smart switching for GitHub/LinkedIn
    if (authMode === 'signup' && !user.isNew) {
      return res.redirect(`https://testi-hub-frontend.vercel.app/login?error=USER_ALREADY_EXISTS`);
    }
    if (authMode === 'login' && user.isNew) {
      return res.redirect(`https://testi-hub-frontend.vercel.app/login?error=USER_NOT_FOUND`);
    }

    // Increment session version for Social Login
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { sessionVersion: { increment: 1 } }
    });

    const { accessToken, refreshToken } = generateTokens(updatedUser.id, updatedUser.sessionVersion);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`https://testi-hub-frontend.vercel.app/login?token=${accessToken}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect(`https://testi-hub-frontend.vercel.app/login?error=server_error`);
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { name, avatar, businessName, businessType, websiteUrl, instagramUrl, facebookUrl, linkedinUrl, phone } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        avatar,
        businessName,
        businessType,
        websiteUrl,
        instagramUrl,
        facebookUrl,
        linkedinUrl,
        phone: phone === '' ? null : phone
      },
    });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        phone: updatedUser.phone,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        businessName: updatedUser.businessName,
        businessType: updatedUser.businessType,
        websiteUrl: updatedUser.websiteUrl,
        instagramUrl: updatedUser.instagramUrl,
        facebookUrl: updatedUser.facebookUrl,
        linkedinUrl: updatedUser.linkedinUrl,
      },
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      const target = error.meta?.target || [];
      const field = Array.isArray(target) ? target[0] : 'field';
      return res.status(400).json({ 
        message: `This ${field} is already linked to another account.`,
        error: 'UNIQUE_CONSTRAINT_FAILED'
      });
    }

    console.error('[UpdateProfile] Detailed Error:', error);
    res.status(500).json({ 
      message: 'Failed to update profile',
      error: error.message,
      code: error.code 
    });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Current password and new password (min 6 chars) required' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) {
      return res.status(404).json({ message: 'User not found or password not set' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid current password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to change password' });
  }
};
