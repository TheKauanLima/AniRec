const nodemailer = require('nodemailer');
const emailConfig = require('../../config/email');

class EmailService
{
  constructor()
  {
    this.transporter = null;
    this.useResend = emailConfig.service === 'resend';
    this.resendApiKey = emailConfig.resendApiKey;

    if (this.useResend)
    {
      this.initializeResend();
    }
    else
    {
      this.initializeTransporter();
    }
  }

  initializeResend()
  {
    try
    {
      if (!this.resendApiKey)
      {
        console.warn('⚠️  Resend API key not configured. Email sending disabled.');
        console.warn('   Set RESEND_API_KEY in .env to enable email verification.');
        return;
      }

      // Import Resend dynamically
      const
      {
        Resend
      } = require('resend');
      this.resendClient = new Resend(this.resendApiKey);
      console.log('✅ Resend email service ready');
    }
    catch (error)
    {
      console.error('❌ Failed to initialize Resend:', error.message);
      console.warn('   Run: npm install resend');
    }
  }

  initializeTransporter()
  {
    try
    {
      // Check if email credentials are configured
      if (!emailConfig.smtp.auth.user || !emailConfig.smtp.auth.pass)
      {
        console.warn('⚠️  Email credentials not configured. Email sending disabled.');
        console.warn('   Set EMAIL_USER and EMAIL_PASSWORD in .env to enable email verification.');
        return;
      }

      this.transporter = nodemailer.createTransporter(emailConfig.smtp);

      // Verify connection
      this.transporter.verify((error, success) =>
      {
        if (error)
        {
          console.error('❌ Email service connection failed:', error.message);
          console.warn('   Email verification will not work until credentials are configured.');
        }
        else
        {
          console.log('✅ Email service ready (SMTP)');
        }
      });
    }
    catch (error)
    {
      console.error('❌ Failed to initialize email service:', error.message);
    }
  }

  async sendVerificationEmail(email, username, verificationToken)
  {
    const verificationUrl = `${emailConfig.frontendUrl}/verify-email?token=${verificationToken}`;

    // Use Resend if configured
    if (this.useResend && this.resendClient)
    {
      try
      {
        const
        {
          data,
          error
        } = await this.resendClient.emails.send(
        {
          from: `${emailConfig.from.name} <${emailConfig.from.address}>`,
          to: [email],
          subject: 'Verify Your Email - AnimeRec',
          html: this.getVerificationEmailTemplate(username, verificationUrl),
        });

        if (error)
        {
          console.error('❌ Resend API error:', error);
          return {
            success: false,
            error: error.message
          };
        }

        console.log('✉️  Verification email sent to:', email, '(via Resend)');
        return {
          success: true,
          messageId: data.id
        };
      }
      catch (error)
      {
        console.error('❌ Failed to send verification email via Resend:', error.message);
        return {
          success: false,
          error: error.message
        };
      }
    }

    // Fall back to SMTP
    if (!this.transporter)
    {
      console.warn('Email service not configured. Skipping verification email.');
      return {
        success: false,
        error: 'Email service not configured'
      };
    }

    const mailOptions = {
      from: `"${emailConfig.from.name}" <${emailConfig.from.address}>`,
      to: email,
      subject: 'Verify Your Email - AnimeRec',
      html: this.getVerificationEmailTemplate(username, verificationUrl),
      text: `Hi ${username},\n\nWelcome to AnimeRec! Please verify your email by clicking this link:\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, please ignore this email.`,
    };

    try
    {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✉️  Verification email sent to:', email);
      return {
        success: true,
        messageId: info.messageId
      };
    }
    catch (error)
    {
      console.error('❌ Failed to send verification email:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendPasswordResetEmail(email, username, resetToken)
  {
    const resetUrl = `${emailConfig.frontendUrl}/reset-password?token=${resetToken}`;

    // Use Resend if configured
    if (this.useResend && this.resendClient)
    {
      try
      {
        const
        {
          data,
          error
        } = await this.resendClient.emails.send(
        {
          from: `${emailConfig.from.name} <${emailConfig.from.address}>`,
          to: [email],
          subject: 'Reset Your Password - AnimeRec',
          html: this.getPasswordResetEmailTemplate(username, resetUrl),
        });

        if (error)
        {
          console.error('❌ Resend API error:', error);
          return {
            success: false,
            error: error.message
          };
        }

        console.log('✉️  Password reset email sent to:', email, '(via Resend)');
        return {
          success: true,
          messageId: data.id
        };
      }
      catch (error)
      {
        console.error('❌ Failed to send password reset email via Resend:', error.message);
        return {
          success: false,
          error: error.message
        };
      }
    }

    // Fall back to SMTP
    if (!this.transporter)
    {
      console.warn('Email service not configured. Skipping password reset email.');
      return {
        success: false,
        error: 'Email service not configured'
      };
    }

    const mailOptions = {
      from: `"${emailConfig.from.name}" <${emailConfig.from.address}>`,
      to: email,
      subject: 'Reset Your Password - AnimeRec',
      html: this.getPasswordResetEmailTemplate(username, resetUrl),
      text: `Hi ${username},\n\nYou requested to reset your password. Click this link to reset:\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.`,
    };

    try
    {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✉️  Password reset email sent to:', email);
      return {
        success: true,
        messageId: info.messageId
      };
    }
    catch (error)
    {
      console.error('❌ Failed to send password reset email:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  getVerificationEmailTemplate(username, verificationUrl)
  {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎬 Welcome to AnimeRec!</h1>
          </div>
          <div class="content">
            <h2>Hi ${username},</h2>
            <p>Thanks for signing up! We're excited to help you discover your next favorite anime.</p>
            <p>To get started, please verify your email address by clicking the button below:</p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
            <p><strong>This link will expire in 24 hours.</strong></p>
            <p>If you didn't create an account with us, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2026 AnimeRec. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getPasswordResetEmailTemplate(username, resetUrl)
  {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hi ${username},</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request a password reset, please ignore this email or contact us if you have concerns.</p>
          </div>
          <div class="footer">
            <p>© 2026 AnimeRec. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();
