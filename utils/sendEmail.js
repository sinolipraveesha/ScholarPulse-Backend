const nodemailer = require('nodemailer');

/**
 * Helper to send email or log email content if SMTP is not configured.
 * @param {Object} options - Email options (to, subject, text, html)
 */
const sendEmail = async (options) => {
    // If credentials are not set, log code to console and act as successful
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('\n======================================================');
        console.log('📬 EMAIL SERVICE LOG (SMTP NOT CONFIGURED)');
        console.log(`To:      ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Message: ${options.text}`);
        console.log('======================================================\n');
        return;
    }

    // Configure transporter
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Define mail options
    const mailOptions = {
        from: `"ScholarPulse" <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
    };

    // Send mail
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${options.to}`);
};

module.exports = sendEmail;
