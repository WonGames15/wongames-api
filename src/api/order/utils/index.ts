const cartGamesIds = async (cart) => {
  return await cart.map((game) => ({
    documentId: game.documentId,
  }));
};

const cartItems = async (cart) => {
  let games = [];

  await Promise.all(
    cart?.map(async (game) => {
      //    const validatedGame = await strapi.services.game.findOne({
      //     id: game.id,
      //   });
      const validatedGame = await strapi
        .query("api::game.game")
        .findOne({ where: { documentId: game.documentId } });

      if (validatedGame) {
        games.push(validatedGame);
      }
    }),
  );

  return games;
};

const getCartTotal = async (games) => {
  const amount = await games.reduce((acc, game) => {
    return acc + game.price;
  }, 0);

  return Number((amount * 100).toFixed(0));
};

export { cartGamesIds, cartItems, getCartTotal };
