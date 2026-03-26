// utils/mailer.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true", // true nếu port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendOtpMail = async (to, otp) => {
  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject: "Mã xác thực OTP",
    html: `
        <div style="margin:0;padding:0;background-color:#f4f7fb;font-family:Arial,sans-serif;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fb;padding:30px 0;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.08);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:28px 32px;text-align:center;color:#ffffff;">
                      <h1 style="margin:0;font-size:28px;font-weight:bold;">Ademy</h1>
                      <p style="margin:8px 0 0;font-size:14px;opacity:0.9;">
                        Nền tảng học tập trực tuyến dành cho bạn
                      </p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:36px 32px;color:#1f2937;">
                      <h2 style="margin:0 0 12px;font-size:24px;color:#111827;">
                        Xác thực tài khoản
                      </h2>
                      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#4b5563;">
                        Xin chào,
                      </p>
                      <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#4b5563;">
                        Cảm ơn bạn đã đăng ký tài khoản. Vui lòng sử dụng mã OTP bên dưới để hoàn tất quá trình xác thực.
                      </p>

                      <!-- OTP Box -->
                      <div style="text-align:center;margin:28px 0;">
                        <div style="display:inline-block;padding:18px 32px;background:#eff6ff;border:2px dashed #2563eb;border-radius:12px;">
                          <p style="margin:0 0 8px;font-size:14px;color:#2563eb;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">
                            Mã OTP của bạn
                          </p>
                          <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#111827;">
                            ${otp}
                          </div>
                        </div>
                      </div>

                      <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#4b5563;">
                        Mã này sẽ hết hạn sau <strong style="color:#dc2626;">5 phút</strong>.
                      </p>
                      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4b5563;">
                        Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này.
                      </p>

                      <!-- CTA -->
                      <div style="text-align:center;margin-top:30px;">
                        <a href="#"
                           style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:15px;font-weight:bold;">
                          Xác thực ngay
                        </a>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding:24px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
                      <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">
                        Đây là email tự động, vui lòng không trả lời email này.
                      </p>
                      <p style="margin:0;font-size:13px;color:#9ca3af;">
                        © 2026 Ademy. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </div>
        `,
  });
};

module.exports = { sendOtpMail };