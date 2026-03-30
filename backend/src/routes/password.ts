import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import User from '../models/User';

const router = Router();
const resend = new Resend(process.env.RESEND_API_KEY);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Request password reset
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await User.findByIdAndUpdate(user._id, { resetToken: token, resetTokenExpiry: expiry });

    const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;

    await resend.emails.send({
      from: 'SuperConnect <onboarding@resend.dev>',
      to: email,
      subject: 'Reset your SuperConnect password',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="color:#1a3fa8">SuperConnect</h2>
          <p>Hi ${user.name},</p>
          <p>You requested a password reset. Click the button below to set a new password:</p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#1a3fa8;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;margin:16px 0">Reset Password</a>
          <p style="color:#6b7280;font-size:0.85rem">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        </div>
      `,
    });

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Failed to send reset email' });
  }
});

// Reset password
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: new Date() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired reset link' });

    const hashed = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(user._id, { password: hashed, resetToken: null, resetTokenExpiry: null });

    res.json({ message: 'Password reset successful' });
  } catch {
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

export default router;
