import { factories } from "@strapi/strapi";
const stripe = require("stripe")(process.env.STRIPE_KEY);

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
            .findOne({ where: { documentId: game.documentId } });

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

      const total = games.reduce((acc, game) => {
        return acc + game.price;
      }, 0);

      if (total === 0) {
        return {
          freeGames: true,
        };
      }

      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: total * 100,
          currency: "usd",
          metadata: { integration_check: "accept_a_payment" },
        });

        return paymentIntent;
      } catch (err) {
        return {
          error: err.raw.message,
        };
      }
    },

    create: async (ctx) => {
      // pegar as informações do frontend
      const { cart, paymentIntentId, paymentMethod } = ctx.request.body;

      // pega o token
      const token =
        await strapi.plugins["users-permissions"].services.jwt.getToken(ctx);

      // pega o id do usuario
      const userId = token.id;

      console.log("USER", userId);
      // pegar as informações do usuário
      const userInfo = await strapi
        .query("plugin::users-permissions.user")
        .findOne({ where: { id: userId } });

      // pegar os jogos
      // pegar o total (saber se é free ou não)
      // pegar o paymentIntentId
      // pegar as informações do pagamento (paymentMethod)
      // salvar no banco
      // enviar um email da compra para o usuário

      return { cart, paymentIntentId, paymentMethod, userInfo };
    },
  }),
);
