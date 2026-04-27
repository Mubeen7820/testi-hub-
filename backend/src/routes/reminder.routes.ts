import express from 'express';
import { sendReminderEmail } from '../lib/mail';
import { protect } from '../middlewares/auth.middleware';
import prisma from '../lib/prisma';

const router = express.Router();

router.post('/send', protect, async (req: any, res: any) => {
  try {
    const { email, note } = req.body;
    
    if (!email || !note) {
      return res.status(400).json({ message: 'Email and note content are required' });
    }

    await sendReminderEmail(email, note);
    
    res.status(200).json({ message: 'Reminder email sent successfully' });
  } catch (error) {
    console.error('[Reminder Route] Error:', error);
    res.status(500).json({ message: 'Failed to send reminder email' });
  }
});

router.post('/schedule', protect, async (req: any, res: any) => {
  try {
    const { date, time, note, isReminder } = req.body;
    const userId = req.user.id;

    if (!date || !note) {
      return res.status(400).json({ message: 'Date and note are required' });
    }

    // Since we don't have a unique constraint on (userId, date), we find and update manually
    const existing = await prisma.activityPlan.findFirst({
      where: { userId, date }
    });

    if (existing) {
      await prisma.activityPlan.update({
        where: { id: existing.id },
        data: { time, note, isReminder, sent: false }
      });
    } else {
      await prisma.activityPlan.create({
        data: { userId, date, time, note, isReminder }
      });
    }

    res.status(200).json({ message: 'Activity plan scheduled successfully' });
  } catch (error) {
    console.error('[Reminder Route] Schedule Error:', error);
    res.status(500).json({ message: 'Failed to schedule reminder' });
  }
});

export default router;
