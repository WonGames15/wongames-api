// import type { Core } from '@strapi/strapi';
import { errors, sanitize } from "@strapi/utils";

const { ForbiddenError, NotFoundError } = errors;
const { createAPISanitizers } = sanitize;

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    const extensionService = strapi.plugin("graphql").service("extension");

    extensionService.use({
      resolvers: {
        Mutation: {
          createWishlist: async (parent, args, context) => {
            console.log("🔥 INTERCEPTOU GRAPHQL (REGISTER) [createWishlist]");
            // console.log("🔥CONTEXT", context);
            // console.log("🔥ARGS", args);

            const user = context.state?.user;

            const { output } = createAPISanitizers({
              getModel: (model) => strapi.getModel(model),
            });

            const contentType = strapi.getModel("api::wishlist.wishlist");

            if (!user) {
              console.error("⚠️ Requisição sem JWT");

              const entity = await strapi
                .service("api::wishlist.wishlist")
                .create({
                  data: { ...args.data },
                });

              return await output(entity, contentType, {
                auth: context.state.auth,
              });
            }

            const userId = user.id;

            // 🔥 verifica se já existe wishlist
            const existing = await strapi.entityService.findMany(
              "api::wishlist.wishlist",
              {
                filters: { user: { id: { $eq: userId } } },
                limit: 1,
              },
            );

            if (existing.length > 0) {
              console.error("❌ User already has a wishlist");
              throw new ForbiddenError("User already has a wishlist");
            }

            const entity = await strapi
              .service("api::wishlist.wishlist")
              .create({
                data: {
                  ...args.data,
                  user: userId,
                },
              });

            return await output(entity, contentType, {
              auth: context.state.auth,
            });
          },

          updateWishlist: async (parent, args, context) => {
            console.log("🔥 INTERCEPTOU GRAPHQL (REGISTER) [updateWishlist]");
            // console.log("🔥CONTEXT", context);
            // console.log("🔥ARGS", args);

            const user = context.state?.user;

            const { output } = createAPISanitizers({
              getModel: (model) => strapi.getModel(model),
            });

            const contentType = strapi.getModel("api::wishlist.wishlist");

            const { documentId, data } = args;

            if (!user) {
              const entity = await strapi
                .documents("api::wishlist.wishlist")
                .update({
                  documentId,
                  data: { ...data },
                });

              return await output(entity, contentType, {
                auth: context.state.auth,
              });
            }

            const userId = user.id;

            // busca wishlist
            const wishlist = await strapi
              .documents("api::wishlist.wishlist")
              .findOne({
                documentId,
                populate: ["user"],
              });

            if (!wishlist || !wishlist.documentId) {
              console.error("❌ Wishlist not found");
              throw new NotFoundError("Wishlist not found");
            }

            // valida dono
            if (!wishlist.user || wishlist.user.id !== userId) {
              console.error("❌ User is not the owner of this wishlist");
              throw new ForbiddenError(
                "You are not allowed to update this wishlist",
              );
            }

            // update seguro
            const entity = await strapi
              .documents("api::wishlist.wishlist")
              .update({
                documentId,
                data: {
                  ...data,
                },
              });

            return await output(entity, contentType, {
              auth: context.state.auth,
            });
          },
        },
      },
    });
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap(/* { strapi }: { strapi: Core.Strapi } */) {},
};
