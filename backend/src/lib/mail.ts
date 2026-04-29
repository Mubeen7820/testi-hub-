import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Explicitly load .env from the server root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // This should be your 16-character App Password
  },
  logger: true,
  debug: true,
});

// Verify connection configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('[Mail] SMTP Connection Error:', error);
  } else {
    console.log('[Mail] Server is ready to take our messages');
  }
});

console.log(`[Mail] Initialized for user: ${process.env.SMTP_USER}`);

export const sendWelcomeEmail = async (to: string, name?: string) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('[Mail] SMTP credentials missing in environment!');
    return;
  }
  const mailOptions = {
    from: `"Testimonial Hub" <${process.env.SMTP_USER}>`, // Using authenticated user to avoid rejection
    to,
    subject: 'Welcome to Testimonial Hub - Account Created Successfully!',
    replyTo: 'no-reply@testimonialhub.com', // Hint that it's no-reply
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h1 style="color: #2563eb; text-align: center;">Welcome to Testimonial Hub!</h1>
        <p style="font-size: 16px;">Hello ${name || 'there'},</p>
        <p style="font-size: 16px; line-height: 1.5;">Your account has been created successfully. We're excited to have you on board!</p>
        <p style="font-size: 16px; line-height: 1.5;">Testimonial Hub helps you convert WhatsApp feedback into powerful testimonials. Upload a screenshot, and we'll handle the rest — extraction, design, and export.</p>
        
        <div style="margin: 30px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #cbd5e1;">
          <h2 style="font-size: 18px; margin-top: 0; color: #1e293b;">What's next?</h2>
          <ul style="padding-left: 20px; font-size: 15px; color: #334155; line-height: 1.6;">
            <li>Log in to your <strong>Dashboard</strong></li>
            <li>Upload your first <strong>Testimonial Screenshot</strong></li>
            <li>Let our <strong>AI extract the magic!</strong></li>
          </ul>
        </div>
        
        <p style="font-size: 16px; line-height: 1.5;">If you have any questions, feel free to explore our platform or contact our support.</p>
        
        <div style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          <p style="font-size: 14px; color: #64748b; margin-bottom: 5px;">Best regards,</p>
          <p style="font-size: 14px; font-weight: bold; color: #1e293b; margin-top: 0;">The Testimonial Hub Team</p>
        </div>
        
        <div style="margin-top: 30px; padding: 15px; background-color: #fff1f2; border-radius: 6px; text-align: center;">
          <p style="font-size: 12px; color: #be123c; margin: 0;">This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    `,
  };

  try {
    console.log(`[Mail] Attempting to send welcome email to ${to}...`);
    await transporter.sendMail(mailOptions);
    console.log(`[Mail] Welcome email sent successfully to ${to}`);
  } catch (error) {
    console.error('[Mail] FAILED to send welcome email:', error);
  }
};

export const sendReminderEmail = async (to: string, note: string) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('[Mail] SMTP credentials missing in environment!');
    return;
  }

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

  const mailOptions = {
    from: `"Testimonial Hub" <${process.env.SMTP_USER}>`,
    to,
    subject: '📅 Schedule Reminder: Action Required',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e2e8f0; border-radius: 24px; background-color: #ffffff; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
        <!-- Header Banner -->
        <div style="background-color: #2563eb; padding: 40px 20px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Schedule Reminder</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your Testimonial Hub Assistant</p>
        </div>
        
        <div style="padding: 40px; background-color: #ffffff;">
          <p style="font-size: 16px; color: #475569; margin-bottom: 24px;">Hello there,</p>
          <p style="font-size: 16px; color: #475569; line-height: 1.6; margin-bottom: 32px;">
            This is a friendly reminder for an activity you scheduled in your planner. Keeping your testimonials organized is the key to a great Wall of Love!
          </p>
          
          <!-- Task Card -->
          <div style="padding: 30px; background-color: #f8fafc; border-radius: 20px; border: 1px solid #f1f5f9; margin-bottom: 32px;">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <span style="font-size: 11px; font-weight: 800; color: #3b82f6; text-transform: uppercase; letter-spacing: 1.5px; background-color: #eff6ff; padding: 4px 10px; border-radius: 6px;">Today's Task</span>
            </div>
            <p style="font-size: 18px; font-weight: 600; color: #1e293b; line-height: 1.5; margin: 0;">
              ${note}
            </p>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin-bottom: 40px;">
            <a href="${clientUrl}/dashboard" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 16px; font-weight: 700; text-decoration: none; padding: 16px 32px; border-radius: 14px; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.2);">
              Open Your Dashboard
            </a>
          </div>

          <p style="font-size: 14px; color: #94a3b8; text-align: center; line-height: 1.5;">
            Once you've completed this task, remember to mark it as finished on your calendar to keep your analytics accurate.
          </p>
        </div>

        <!-- Footer -->
        <div style="padding: 30px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
          <p style="font-size: 12px; color: #94a3b8; margin: 0 0 10px 0;">
            Sent by Testimonial Hub &bull; Helping you grow with social proof
          </p>
          <p style="font-size: 11px; color: #cbd5e1; margin: 0;">
            This is an automated reminder based on your planner settings.
          </p>
        </div>
      </div>
    `,
  };

  try {
    console.log(`[Mail] Attempting to send reminder to ${to}...`);
    await transporter.sendMail(mailOptions);
    console.log(`[Mail] Reminder sent successfully to ${to}`);
  } catch (error) {
    console.error('[Mail] FAILED to send reminder email:', error);
    throw error;
  }
};
