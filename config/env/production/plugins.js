module.exports = ({ env }) => ({
  email: {
    config: {
      provider: "nodemailer",
      providerOptions: {
        host: env("SMTP_HOST", "smtp.gmail.com"),
        port: env("SMTP_PORT", 587),
        auth: {
          user: env("EMAIL_USER", ""),
          pass: env("EMAIL_PASS", ""),
        },
        // ... any custom nodemailer options
      },
      settings: {
        defaultFrom: env("EMAIL_USER", ""),
        defaultReplyTo: env("EMAIL_USER", ""),
      },
    },
  },
});
