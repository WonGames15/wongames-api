export default {
  routes: [
    {
      method: "POST",
      path: "/games/populate",
      handler: "api::game.game.populate",
    },
  ],
};
