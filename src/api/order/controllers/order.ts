import { factories } from "@strapi/strapi";
import { cartGamesIds, cartItems, getCartTotal } from "../utils";

const stripe = require("stripe")(process.env.STRIPE_KEY);

export default factories.createCoreController(
  "api::order.order",
  ({ strapi }) => ({
    async createPaymentIntent(ctx) {
      const { cart } = ctx.request.body;

      // simplify cart data
      const gamesIds = await cartGamesIds(cart);

      // get all games
      const games = await cartItems(gamesIds);

      if (!games.length) {
        ctx.response.status = 404;
        return {
          error: "No valid games found!",
        };
      }

      const total = await getCartTotal(games);

      if (total === 0) {
        return {
          freeGames: true,
        };
      }

      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: total * 100,
          currency: "usd",
          metadata: { cart: JSON.stringify(gamesIds) },
        });

        return paymentIntent;
      } catch (err) {
        return {
          error: err.raw.message,
        };
      }
    },

    async create(ctx) {
      // pegar as informações do frontend
      const { cart, paymentIntentId, paymentMethod } = ctx.request.body;

      // pega o token
      const token =
        await strapi.plugins["users-permissions"].services.jwt.getToken(ctx);

      // pega o id do usuario
      const userId = token.id;

      // pegar as informações do usuário
      const userInfo = await strapi
        .query("plugin::users-permissions.user")
        .findOne({ where: { id: userId } });

      // simplify cart data
      const gamesIds = await cartGamesIds(cart);

      // pegar os jogos
      const games = await cartItems(gamesIds);

      // pegar o total (saber se é free ou não)
      const total_in_cents = await getCartTotal(games);

      // precisa pegar do frontend os valores do paymentMethod
      // e recuperar por aqui

      // salvar no banco
      const entry = {
        total_in_cents,
        payment_intent_id: paymentIntentId,
        card_brand: null,
        card_last4: null,
        user: userInfo,
        games,
      };

      const entity = await strapi.service("api::order.order").create({
        data: entry,
        populate: ["user", "games"],
      });

      // enviar um email da compra para o usuário

      return this.sanitizeOutput(entity, ctx);
    },
  }),
);
