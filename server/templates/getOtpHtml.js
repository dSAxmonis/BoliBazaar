const getOtpHtml = ({ email, otp }) => {
  return `
    <!DOCTYPE html>
    <html>
      <body style="
        margin: 0;
        padding: 0;
        background: #f6f7fb;
        font-family: Arial, sans-serif;
      ">
        <div style="
          max-width: 500px;
          margin: 40px auto;
          background: white;
          padding: 32px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        ">
          
          <h2 style="
            margin-bottom: 20px;
            color: #111827;
          ">
            Verify your email
          </h2>

          <p style="
            color: #4b5563;
            line-height: 1.6;
          ">
            Hello ${email},
          </p>

          <p style="
            color: #4b5563;
            line-height: 1.6;
          ">
            Use the verification code below to verify your account.
          </p>

          <div style="
            margin: 24px 0;
            padding: 16px;
            background: #f3f4f6;
            border-radius: 8px;
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #111827;
          ">
            ${otp}
          </div>

          <p style="
            color: #6b7280;
            font-size: 14px;
          ">
            This code will expire in 5 minutes.
          </p>

          <p style="
            color: #6b7280;
            font-size: 14px;
          ">
            If you didn't request this code, you can safely ignore this email.
          </p>

        </div>
      </body>
    </html>
  `;
};

module.exports = { getOtpHtml };
