const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendSubscriptionEmail = async (toEmail, userName, category) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "🎉 Category Subscription Confirmation!",
    html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #007bff;">Dear ${userName},</h2>
                <p>We are excited to inform you that you've been subscribed to ${category}! category 🎉</p>
                <p>From now on you'll receive ${category} related content</p>               
                <p>Thank you for subscribing!</p>
                <p>Best regards,<br><strong>Pacock India Team</strong></p>

                <hr>
                <p style="font-size: 12px; color: gray;">
                    This is an automated message. Please do not reply.
                </p>
            </div>
        `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Subscription confirmation email sent successfully");
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};

module.exports = { sendSubscriptionEmail };
