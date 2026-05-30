export default ({ env }) => ({
  upload: {
    config: {
      provider: env("CLOUDINARY_NAME") ? "cloudinary" : "local",
      ...(env("CLOUDINARY_NAME") && {
        providerOptions: {
          cloud_name: env("CLOUDINARY_NAME"),
          api_key: env("CLOUDINARY_KEY"),
          api_secret: env("CLOUDINARY_SECRET"),
        },
        actionOptions: {
          upload: {},
          delete: {},
        },
      }),
    },
  },
  email: {
    config: {
      provider: "nodemailer",
      providerOptions: {
        host: env("SMTP_HOST", "smtp-relay.brevo.com"),
        port: env.int("SMTP_PORT", 587),
        ignoreTLS: env.bool("SMTP_IGNORE_TLS", false),

        auth: {
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
