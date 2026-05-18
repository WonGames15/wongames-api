/**
 * wishlist controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::wishlist.wishlist",
  ({ strapi }) => ({
    async create(ctx) {
      try {
        const token =
          await strapi.plugins["users-permissions"].services.jwt.getToken(ctx);

        if (!token) {
          console.error("⚠️ Requisição sem JWT");

          const entity = await strapi.service("api::wishlist.wishlist").create({
            data: { ...ctx.request.body.data },
          });

          return this.sanitizeOutput(entity, ctx);
        }

        const userId = token.id;

        // verifica se já existe
        const existing = await strapi.entityService.findMany(
          "api::wishlist.wishlist",
          {
            filters: { user: { id: { $eq: userId } } },
            limit: 1,
          },
        );

        if (existing.length > 0) {
          console.error("❌ User already has a wishlist");
          return ctx.forbidden("User already has a wishlist");
        }

        const body = {
          data: {
            ...ctx.request.body.data,
            user: userId,
          },
        };

        const entity = await strapi
          .service("api::wishlist.wishlist")
          .create(body);

        return this.sanitizeOutput(entity, ctx);
      } catch (err) {
        console.error("❌ Error creating wishlist:", err);
        throw new Error("Unauthorized or invalid request");
      }
    },

    async update(ctx) {
      try {
        const { id } = ctx.params;

        const token =
          await strapi.plugins["users-permissions"].services.jwt.getToken(ctx);

        if (!token) {
          console.error("⚠️ Requisição sem JWT");

          const entity = await strapi
            .service("api::wishlist.wishlist")
            .update(id, ctx.request.body);

          return this.sanitizeOutput(entity, ctx);
        }

        const userId = token.id;

        const wishlist = await strapi
          .documents("api::wishlist.wishlist")
          .findOne({
            documentId: id,
            populate: ["user"],
          });

        if (!wishlist || !wishlist.documentId) {
          console.error("❌ Wishlist not found");
          return ctx.notFound("Wishlist not found");
        }

        // valida dono
        if (!wishlist.user || wishlist.user.id !== userId) {
          console.error("❌ User is not the owner of this wishlist");
          return ctx.forbidden("You are not allowed to update this wishlist");
        }

        const entity = await strapi.documents("api::wishlist.wishlist").update({
          documentId: id,
          data: {
            ...ctx.request.body.data,
          },
        });

        return this.sanitizeOutput(entity, ctx);
      } catch (err) {
        console.error("❌ Error updating wishlist:", err);
        throw new Error("Unauthorized or invalid request");
      }
    },
  }),
);
