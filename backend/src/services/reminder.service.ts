import cron from 'node-cron';
import prisma from '../lib/prisma';
import { sendReminderEmail } from '../lib/mail';

export const initReminderJob = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      // Adjust to local time if needed, but for now we'll match against date strings
      const currentDateStr = now.toDateString();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      console.log(`[Reminder Job] Checking for reminders at ${currentDateStr} ${currentTimeStr}...`);

      // Find activities for TODAY that have a reminder enabled and HAVEN'T been sent
      const pendingReminders = await prisma.activityPlan.findMany({
        where: {
          date: currentDateStr,
          time: { startsWith: currentTimeStr }, // Match HH:mm even if stored as HH:mm:ss
          isReminder: true,
          sent: false
        },
        include: {
          user: true
        }
      });

      if (pendingReminders.length > 0) {
        console.log(`[Reminder Job] Found ${pendingReminders.length} reminders to send!`);
        
        for (const reminder of pendingReminders) {
          if (reminder.user.email) {
            try {
              await sendReminderEmail(reminder.user.email, reminder.note);
              
              // Mark as sent
              await prisma.activityPlan.update({
                where: { id: reminder.id },
                data: { sent: true }
              });
              
              console.log(`[Reminder Job] Successfully sent email to ${reminder.user.email}`);
            } catch (err) {
              console.error(`[Reminder Job] Failed to send email to ${reminder.user.email}:`, err);
            }
          }
        }
      }
    } catch (error) {
      console.error('[Reminder Job] Unexpected Error:', error);
    }
  });
};
