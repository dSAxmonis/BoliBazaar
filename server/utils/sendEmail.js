const { createTransport } = require("nodemailer");

const sendEmail = async (email, subject, html) => {
   const transporter = createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD
    }
   });

   await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: email,
    subject,
    html
   });
};

module.exports = sendEmail;
