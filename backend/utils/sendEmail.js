/**
 * Helper to send email via Resend HTTPS API (port 443) or fall back to Nodemailer SMTP / Console logging.
 * @param {Object} options - Email options (to, subject, text, html)
 */
const sendEmail = async (options) => {
    // 1. Check if Resend API Key is configured (Preferred for Render over port 443)
    if (process.env.RESEND_API_KEY) {
        console.log('Sending email via Resend API...');
        try {
            const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: `ScholarPulse <${fromEmail}>`,
                    to: options.to,
                    subject: options.subject,
                    text: options.text,
                    html: options.html,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Resend API returned an error');
            }
            console.log(`Email successfully sent via Resend API to ${options.to}. ID: ${data.id}`);
            return;
        } catch (error) {
            console.error('Error sending email via Resend:', error.message);
            throw error;
        }
    }

    // 2. Fallback to Nodemailer SMTP (if SMTP credentials are provided)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        console.log('Sending email via Nodemailer SMTP...');
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"ScholarPulse" <${process.env.EMAIL_USER}>`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully via Nodemailer SMTP to ${options.to}`);
        return;
    }

    // 3. Fallback to Console Logging (if no API keys or credentials are set)
    console.log('\n======================================================');
    console.log('📬 EMAIL SERVICE LOG (NO MAIL PROVIDER CONFIGURED)');
    console.log(`To:      ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.text}`);
    console.log('======================================================\n');
};

module.exports = sendEmail;
