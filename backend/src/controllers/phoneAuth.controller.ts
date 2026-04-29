import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import jwt from 'jsonwebtoken';

import { sendSMS } from '../lib/sms';

// Helper to generate random 6‑digit OTP
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Request OTP – expects { phone: string }
export const requestOtp = async (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ message: 'Phone number required' });
  }
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  
  // Store OTP
  await prisma.oTP.create({
    data: { phone, code, expiresAt },
  });

  // Send the actual SMS
  const sent = await sendSMS(phone, `Your OTP code is: ${code}`);
  
  if (!sent) {
    // During development, we still return the code so you can test without an API key
    return res.json({ 
      message: 'OTP could not be sent via SMS, showing here for testing', 
      code 
    });
  }

  return res.json({ message: 'OTP sent successfully' });
};

// Verify OTP – expects { phone: string, code: string }
export const verifyOtp = async (req: Request, res: Response) => {
  const { phone, code } = req.body;
  if (!phone || !code) {
    return res.status(400).json({ message: 'Phone and code required' });
  }
  const otp = await prisma.oTP.findFirst({
    where: { phone, code, used: false },
    orderBy: { createdAt: 'desc' },
  });
  if (!otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }
  if (otp.expiresAt < new Date()) {
    return res.status(400).json({ message: 'OTP expired' });
  }
  // Mark OTP used
  await prisma.oTP.update({ where: { id: otp.id }, data: { used: true } });

  // Find or create user by phone
  let user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    user = await prisma.user.create({
      data: { phone, provider: 'phone' },
    });
  }
  // Issue JWT tokens (same as other flows)
  const accessToken = jwt.sign({ userId: user.id, sessionVersion: user.sessionVersion }, process.env.JWT_ACCESS_SECRET!, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId: user.id, sessionVersion: user.sessionVersion }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return res.json({ accessToken, user: { id: user.id, phone: user.phone } });
};
