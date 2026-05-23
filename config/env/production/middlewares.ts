export default [
  "strapi::logger",
  "strapi::errors",
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,

        directives: {
          "connect-src": ["'self'", "https:"],

          "script-src": ["'self'", "'unsafe-inline'", "editor.unlayer.com"],

          "frame-src": ["'self'", "editor.unlayer.com"],

          "img-src": [
            "'self'",
            "data:",
            "blob:",
            "market-assets.strapi.io",
            "res.cloudinary.com",
          ],

          "media-src": [
            "'self'",
            "data:",
            "blob:",
            "market-assets.strapi.io",
            "res.cloudinary.com",
          ],

          upgradeInsecureRequests: null,
        },
      },
    },
  },
  "strapi::cors",
  "strapi::poweredBy",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];
