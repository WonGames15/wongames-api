/**
 * order controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController("api::order.order", () => ({
  async createPaymentIntent(ctx) {
    return "Hello World!";
  },
}));
