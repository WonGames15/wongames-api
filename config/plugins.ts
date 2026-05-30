export default ({ env }) => ({
  "config-sync": {
    enabled: true,
    config: {
      importOnBootstrap: true, // 👈 aplica automaticamente no deploy
    },
  },
  email: {
    config: {
      provider: "nodemailer",
      providerOptions: {
        host: env("SMTP_HOST", "localhost"),
        port: env.int("SMTP_PORT", 1025),
        ignoreTLS: env.bool("SMTP_IGNORE_TLS", true),

        auth: env("SMTP_USERNAME") && {
          user: env("SMTP_USERNAME"),
          pass: env("SMTP_PASSWORD"),
        },
      },
      settings: {
        defaultFrom: "matheus150101miranda@gmail.com",
        defaultReplyTo: "matheus150101miranda@gmail.com",
      },
    },
  },
});
