const verifyEmailHtml = ({ email, token }) => {
  const appName = process.env.APP_NAME || "BoliBazaar";
  const baseUrl =
    process.env.FRONTEND_URL || "http://localhost:5173";

  const verifyUrl =
    `${baseUrl.replace(/\/+$/, "")}/token/${encodeURIComponent(token)}`;

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
            Verify your account
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
            Thanks for registering with ${appName}.
            Click the button below to verify your account.
          </p>

          <div style="
            text-align: center;
            margin: 30px 0;
          ">
            <a
              href="${verifyUrl}"
              style="
                display: inline-block;
                padding: 12px 20px;
                background: #111827;
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
              "
            >
              Verify account
            </a>
          </div>

          <p style="
            color: #6b7280;
            font-size: 14px;
          ">
            If the button doesn't work, copy this link into your browser:
          </p>

          <p style="
            color: #111827;
            font-size: 14px;
            word-break: break-all;
          ">
            ${verifyUrl}
          </p>

          <p style="
            color: #6b7280;
            font-size: 14px;
          ">
            If you didn't create this account, you can safely ignore this email.
          </p>

          <hr style="
            border: none;
            border-top: 1px solid #e5e7eb;
            margin: 30px 0;
          ">

          <p style="
            text-align: center;
            color: #9ca3af;
            font-size: 12px;
          ">
            © ${new Date().getFullYear()} ${appName}
          </p>

        </div>
      </body>
    </html>
  `;
};

module.exports = { verifyEmailHtml };
