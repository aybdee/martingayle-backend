import axios from "axios";

const PAYMENT_PLANS = {
  BASIC_NORMAL: { code: "PLN_xk7biqljij98mz3", amount: 15000 },
  CUSTOMIZED_NORMAL: { code: "PLN_9akv9f8l7nskeae", amount: 25000 },
  BASIC_PRIME: { code: "PLN_sgzcvopxtr8u50t", amount: 30000 },
  CUSTOMIZED_PRIME: { code: "PLN_9l7seqnobpqryde", amount: 50000 },
};

const PAYMENT_PLANS_TEST = {
  BASIC_NORMAL: { code: "PLN_05zw7y3gg43vgnz", amount: 15000 },
  CUSTOMIZED_NORMAL: { code: "PLN_fce3vhyz5gst2pt", amount: 25000 },
  BASIC_PRIME: { code: "PLN_n6pdc3tk1c1jw6v", amount: 30000 },
  CUSTOMIZED_PRIME: { code: "PLN_8aenmht8sak8wz6", amount: 50000 },
};

export default async function initiatePaystackPayment(
  email: string,
  plan: keyof typeof PAYMENT_PLANS
) {
  const { code, amount } = PAYMENT_PLANS_TEST[plan];

  const response = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    {
      email: email,
      currency: "NGN",
      amount: amount,
      plan: code,
      metadata: {
        plan: plan,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    }
  );

  return response.data;
}
