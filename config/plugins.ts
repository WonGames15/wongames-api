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
        host: "localhost",
        port: 1025,
        ignoreTLS: true,
      },
    },
  },
});
