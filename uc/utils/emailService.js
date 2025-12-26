const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-app-password'
    }
});

if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    transporter.verify((error, success) => {
        if (error) {
            console.error(' Email service error:', error.message);
        } else {
            console.log(' Email service ready');
        }
    });
} else {
    console.log(' Email credentials not set — skipping email service verification');
}


exports.sendVerificationEmail = async (email, name, verificationToken) => {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
        from: `"UniCollab" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify Your Email - UniCollab',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #1976d2; color: white; padding: 20px; text-align: center; }
                    .content { background: #f9f9f9; padding: 30px; }
                    .button { 
                        display: inline-block; 
                        padding: 12px 30px; 
                        background: #1976d2; 
                        color: white; 
                        text-decoration: none; 
                        border-radius: 5px;
                        margin: 20px 0;
                    }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to UniCollab!</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${name},</h2>
                        <p>Thank you for registering with UniCollab. Please verify your email address to activate your account.</p>
                        <p>Click the button below to verify your email:</p>
                        <a href="${verificationUrl}" class="button">Verify Email</a>
                        <p>Or copy and paste this link in your browser:</p>
                        <p style="word-break: break-all; color: #1976d2;">${verificationUrl}</p>
                        <p><strong>This link will expire in 24 hours.</strong></p>
                        <p>If you didn't create an account, please ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} UniCollab. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(` Verification email sent to: ${email}`);
        return { success: true };
    } catch (error) {
        console.error(' Email sending failed:', error.message);
        return { success: false, error: error.message };
    }
};


exports.sendPasswordResetEmail = async (email, name, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
        from: `"UniCollab" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset Request - UniCollab',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #f44336; color: white; padding: 20px; text-align: center; }
                    .content { background: #f9f9f9; padding: 30px; }
                    .button { 
                        display: inline-block; 
                        padding: 12px 30px; 
                        background: #f44336; 
                        color: white; 
                        text-decoration: none; 
                        border-radius: 5px;
                        margin: 20px 0;
                    }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${name},</h2>
                        <p>We received a request to reset your password for your UniCollab account.</p>
                        <p>Click the button below to reset your password:</p>
                        <a href="${resetUrl}" class="button">Reset Password</a>
                        <p>Or copy and paste this link in your browser:</p>
                        <p style="word-break: break-all; color: #f44336;">${resetUrl}</p>
                        <p><strong>This link will expire in 1 hour.</strong></p>
                        <p>If you didn't request a password reset, please ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} UniCollab. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Password reset email sent to: ${email}`);
        return { success: true };
    } catch (error) {
        console.error('❌ Email sending failed:', error.message);
        return { success: false, error: error.message };
    }
};

exports.sendWelcomeEmail = async (email, name) => {
    const mailOptions = {
        from: `"UniCollab" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Welcome to UniCollab!',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #4caf50; color: white; padding: 20px; text-align: center; }
                    .content { background: #f9f9f9; padding: 30px; }
                    .button { 
                        display: inline-block; 
                        padding: 12px 30px; 
                        background: #4caf50; 
                        color: white; 
                        text-decoration: none; 
                        border-radius: 5px;
                        margin: 20px 0;
                    }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1> Welcome to UniCollab!</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${name},</h2>
                        <p>Your email has been verified successfully! Welcome to the UniCollab community.</p>
                        <p>You can now:</p>
                        <ul>
                            <li>Create and join projects</li>
                            <li>Collaborate with students and supervisors</li>
                            <li>Share ideas and resources</li>
                            <li>Get feedback on your work</li>
                        </ul>
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="button">Get Started</a>
                        <p>If you have any questions, feel free to contact our support team.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} UniCollab. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to: ${email}`);
        return { success: true };
    } catch (error) {
        console.error(' Email sending failed:', error.message);
        return { success: false, error: error.message };
    }
};