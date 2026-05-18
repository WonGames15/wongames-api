export default {
  routes: [
    {
      method: "POST",
      path: "/orders/create-payment-intent",
      handler: "api::order.order.createPaymentIntent",
    },
  ],
};
