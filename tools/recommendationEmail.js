const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendRecommendationEmail = async (toEmail, userName, content) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "🎉 Recommendation Email!",
    html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px;">
                  <h2 style="color: #007bff;">Dear ${userName},</h2>
                  <p>Here are some recommendations for you 🎉</p>
  
                  <h3 style="color: #333;">Recommended Articles:</h3>
                  <ul style="padding-left: 20px;">
                      ${content
                        .map(
                          (item) => `
                          <li style="margin-bottom: 10px;">
                              <a href="${item.thumbnail}" style="color: #007bff; text-decoration: none; font-weight: bold;">
                                  ${item.title}
                              </a>
                          </li>
                      `
                        )
                        .join("")}
                  </ul>
  
                  <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                  <p style="font-size: 12px; color: gray; text-align: center;">
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

module.exports = { sendRecommendationEmail };
