export async function createUsers() {
  console.log("CRIANDO USERS...");

  const users = [
    {
      username: "Cypress",
      email: "ci@wongames.com",
      password: "Teste123",
    },
  ];

  for (const user of users) {
    const existingUser = await strapi
      .query("plugin::users-permissions.user")
      .findOne({
        where: {
          email: user.email,
        },
      });

    if (existingUser) {
      console.log(`Usuário já existe: ${user.email}`);
      continue;
    }

    const authenticatedRole = await strapi
      .query("plugin::users-permissions.role")
      .findOne({
        where: {
          type: "authenticated",
        },
      });

    await strapi.plugins["users-permissions"].services.user.add({
      username: user.username,
      email: user.email,
      password: user.password,

      confirmed: true,
      blocked: false,

      provider: "local",
      role: authenticatedRole.id,
    });

    console.log(`Usuário criado: ${user.email}`);
  }
}
