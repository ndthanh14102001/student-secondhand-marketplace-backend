module.exports = ({ env }) => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', 'smtp.gmail.com'),
        port: env('SMTP_PORT', 587),
        auth: {
          user: "ndthanh14102001@gmail.com",
          pass: "voigrrtowzsbjzjn",
        },
        // ... any custom nodemailer options
      },
      settings: {
        defaultFrom: 'ndthanh14102001@gmail.com',
        defaultReplyTo: 'ndthanh14102001@gmail.com',
      },
    },
  },
});