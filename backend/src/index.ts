import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import './lib/passport';
import authRoutes from './routes/auth.routes';
import aiRoutes from './routes/ai.routes';
import reminderRoutes from './routes/reminder.routes';
import testimonialRoutes from './routes/testimonial.routes';
import { initReminderJob } from './services/reminder.service';

const app = express();
const PORT = process.env.PORT || 5000;

// Start background jobs
initReminderJob();

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: true, // Allow all origins in development to fix connection issues
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// Routes

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/testimonials', testimonialRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

process.on('exit', (code) => {
  console.log(`Process is about to exit with code: ${code}`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});