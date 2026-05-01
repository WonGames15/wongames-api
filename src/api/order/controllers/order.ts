/**
 * order controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::order.order",
  ({ strapi }) => ({
    async createPaymentIntent(ctx) {
      const { cart } = ctx.request.body;

      let games = [];

      await Promise.all(
        cart?.map(async (game) => {
          const validatedGame = await strapi
            .query("api::game.game")
            .findOne({ where: { id: game.id } });

          if (validatedGame) {
            games.push(validatedGame);
          }
        }),
      );

      if (!games.length) {
        ctx.response.status = 404;
        return {
          error: "No valid games found!",
        };
      }

      return games;
    },
  }),
);
