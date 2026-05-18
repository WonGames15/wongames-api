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
          amount: total,
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
      let paymentInfo;
      if (total_in_cents !== 0) {
        try {
          paymentInfo = await stripe.paymentMethods.retrieve(paymentMethod);
        } catch (err) {
          console.error(
            "Ocorreu algum erro ao recuperar dados dos métodos de pagamento =>",
            err,
          );

          ctx.response.status = 402;
          return { error: err.message };
        }
      }

      // salvar no banco
      const entry = {
        total_in_cents,
        payment_intent_id: paymentIntentId,
        card_brand: paymentInfo?.card?.brand,
        card_last4: paymentInfo?.card?.last4,
        user: userInfo,
        games,
      };

      const entity = await strapi.service("api::order.order").create({
        data: entry,
        populate: ["user", "games"],
      });

      const gamesHtml = games
        .map(
          (game) => `
            <li>
              <a href="http://localhost:3000/game/${game.slug}">
                ${game.name}
              </a> - Price: <strong>$${Number(game.price).toFixed(2)}</strong>
            </li>
          `,
        )
        .join("");

      const gamesText = games
        .map(
          (game) => `${game.name} - Price: $${Number(game.price).toFixed(2)}`,
        )
        .join("\n");

      // enviar um email da compra para o usuário
      await strapi
        .plugin("email-designer-5")
        .service("email")
        .sendTemplatedEmail(
          {
            to: userInfo.email,
            from: "no-reply@wongames.com",
          },
          {
            templateReferenceId: 1,
          },
          {
            user: userInfo,
            payment: {
              total: `$ ${total_in_cents / 100}`,
              card_brand: entry.card_brand,
              card_last4: entry.card_last4,
            },
            gamesText,
            gamesHtml,
          },
        );

      return this.sanitizeOutput(entity, ctx);
    },
  }),
);
