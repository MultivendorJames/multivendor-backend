const config = require("../config/config");
const stripe = require("stripe")(process.env.STRIPE_KEY);
require("dotenv").config(); // dotenv

exports.createCheckoutSession = async (req, res) => {
  const orderId = Math.floor(Math.random() * 999999 + 1);
  const products = req.body.products;

  const line_items = products.map((item) => {
    return {
      price_data: {
        currency: config.currency,
        unit_amount: parseFloat(item.price) * 100,
        product_data: {
          name: item.name,
          images: [`${process.env.API_URL}/uploads/${item.image}`],
        },
      },
      quantity: item.quantity,
    };
  });

  const session = await stripe.checkout.sessions.create({
    line_items,
    mode: "payment",
    success_url: `${
      process.env.FRONTEND_URL
    }/success?session_id={CHECKOUT_SESSION_ID}&data=${encodeURIComponent(
      JSON.stringify({ ...req.body, orderId })
    )}`,
    cancel_url: `${process.env.FRONTEND_URL}/cancel`,
  });

  res.send({ url: session.url });
};
