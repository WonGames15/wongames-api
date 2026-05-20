import { mergeDeep } from "../utils";

const permissionsPublicToEnable = {
  "api::banner": {
    controllers: {
      banner: {
        find: { enabled: true, policy: "" },
        findOne: { enabled: true, policy: "" },
      },
    },
  },
  "api::category": {
    controllers: {
      category: {
        find: { enabled: true, policy: "" },
      },
    },
  },
  "api::developer": {
    controllers: {
      developer: {
        find: { enabled: true, policy: "" },
      },
    },
  },
  "api::game": {
    controllers: {
      game: {
        populate: { enabled: true, policy: "" },
        find: { enabled: true, policy: "" },
        findOne: { enabled: true, policy: "" },
      },
    },
  },
  "api::home": {
    controllers: {
      home: {
        find: { enabled: true, policy: "" },
      },
    },
  },
  "api::order": {
    controllers: {
      order: {
        create: { enabled: true, policy: "" },
        find: { enabled: true, policy: "" },
        findOne: { enabled: true, policy: "" },
      },
    },
  },
  "api::platform": {
    controllers: {
      platform: {
        find: { enabled: true, policy: "" },
        findOne: { enabled: true, policy: "" },
      },
    },
  },
  "api::publisher": {
    controllers: {
      publisher: {
        find: { enabled: true, policy: "" },
        findOne: { enabled: true, policy: "" },
      },
    },
  },
  "api::recommended": {
    controllers: {
      recommended: {
        find: { enabled: true, policy: "" },
      },
    },
  },
  "api::wishlist": {
    controllers: {
      wishlist: {
        find: { enabled: true, policy: "" },
        findOne: { enabled: true, policy: "" },
      },
    },
  },
  "plugin::email": {
    controllers: {
      email: {
        send: { enabled: true, policy: "" },
      },
    },
  },
  "plugin::upload": {
    controllers: {
      "content-api": {
        find: { enabled: true, policy: "" },
        findOne: { enabled: true, policy: "" },
        upload: { enabled: true, policy: "" },
      },
    },
  },
  "plugin::users-permissions": {
    controllers: {
      auth: {
        callback: { enabled: true, policy: "" },
        resetPassword: { enabled: true, policy: "" },
        connect: { enabled: true, policy: "" },
        forgotPassword: { enabled: true, policy: "" },
        register: { enabled: true, policy: "" },
        emailConfirmation: { enabled: true, policy: "" },
        sendEmailConfirmation: { enabled: true, policy: "" },
      },
      user: {
        find: { enabled: true, policy: "" },
        findOne: { enabled: true, policy: "" },
        me: { enabled: true, policy: "" },
      },
      role: {
        findOne: { enabled: true, policy: "" },
        find: { enabled: true, policy: "" },
      },
    },
  },
};

const permissionsAuthenticatedToEnable = {
  "api::banner": {
    controllers: {
      banner: {
        find: { enabled: true, policy: "" },
      },
    },
  },
  "api::category": {
    controllers: {
      category: {
        find: { enabled: true, policy: "" },
      },
    },
  },
  "api::developer": {
    controllers: {
      developer: {
        find: { enabled: true, policy: "" },
      },
    },
  },
  "api::game": {
    controllers: {
      game: {
        find: { enabled: true, policy: "" },
      },
    },
  },
  "api::home": {
    controllers: {
      home: {
        find: { enabled: true, policy: "" },
      },
    },
  },
  "api::order": {
    controllers: {
      order: {
        createPaymentIntent: { enabled: true, policy: "" },
        create: { enabled: true, policy: "" },
        find: { enabled: true, policy: "" },
        findOne: { enabled: true, policy: "" },
        update: { enabled: true, policy: "" },
      },
    },
  },
  "api::platform": {
    controllers: {
      platform: {
        find: { enabled: true, policy: "" },
      },
    },
  },
  "api::publisher": {
    controllers: {
      publisher: {
        find: { enabled: true, policy: "" },
      },
    },
  },
  "api::recommended": {
    controllers: {
      recommended: {
        find: { enabled: true, policy: "" },
      },
    },
  },
  "api::wishlist": {
    controllers: {
      wishlist: {
        create: { enabled: true, policy: "" },
        update: { enabled: true, policy: "" },
        find: { enabled: true, policy: "" },
      },
    },
  },
  "plugin::email": {
    controllers: {
      email: {
        send: { enabled: true, policy: "" },
      },
    },
  },
  "plugin::upload": {
    controllers: {
      "content-api": {
        find: { enabled: true, policy: "" },
        findOne: { enabled: true, policy: "" },
        upload: { enabled: true, policy: "" },
      },
    },
  },
  "plugin::users-permissions": {
    controllers: {
      auth: {
        changePassword: { enabled: true, policy: "" },
        resetPassword: { enabled: true, policy: "" },
        forgotPassword: { enabled: true, policy: "" },
        register: { enabled: true, policy: "" },
        sendEmailConfirmation: { enabled: true, policy: "" },
      },
      user: {
        create: { enabled: true, policy: "" },
        update: { enabled: true, policy: "" },
        find: { enabled: true, policy: "" },
        findOne: { enabled: true, policy: "" },
        me: { enabled: true, policy: "" },
      },
    },
  },
};

async function applyPermissions(roleType: string, permissions: object) {
  const role = await strapi
    .query("plugin::users-permissions.role")
    .findOne({ where: { type: roleType } });

  const currentRole = await strapi
    .plugin("users-permissions")
    .service("role")
    .findOne(role.id, ["permissions"]);

  const merged = mergeDeep(currentRole.permissions, permissions);

  await strapi
    .plugin("users-permissions")
    .service("role")
    .updateRole(role.id, { ...currentRole, permissions: merged });

  console.log(`✅ Permissões configuradas: ${roleType}`);
}

export async function setPermissions() {
  console.log("CONFIGURANDO PERMISSIONS...");

  await applyPermissions("public", permissionsPublicToEnable);
  await applyPermissions("authenticated", permissionsAuthenticatedToEnable);

  console.log("PERMISSIONS CONFIGURADAS!");
}
