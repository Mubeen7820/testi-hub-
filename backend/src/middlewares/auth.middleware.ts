import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

interface JwtPayload {
  userId: string;
  sessionVersion: number;
}



export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        role: true, 
        avatar: true, 
        businessName: true, 
        businessType: true,
        websiteUrl: true,
        instagramUrl: true,
        facebookUrl: true,
        linkedinUrl: true,
        sessionVersion: true
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Single Session Enforcement: Check if token version matches DB version
    if (user.sessionVersion !== decoded.sessionVersion) {
      return res.status(401).json({ 
        message: 'Your session has expired because you signed in on another device.',
        error: 'SESSION_REVOKED'
      });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};
