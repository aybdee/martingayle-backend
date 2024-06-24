import axios from "axios";

const PAYMENT_PLANS = {
  BASIC_NORMAL: { code: "PLN_xk7biqljij98mz3", amount: 15000 },
  CUSTOMIZED_NORMAL: { code: "PLN_xeayfpqgb59rb9a", amount: 25000 },
  BASIC_PRIME: { code: "PLN_ryeke7ub2mm4bnh", amount: 30000 },
  CUSTOMIZED_PRIME: { code: "PLN_wcjmc0mbjn05kcg", amount: 50000 },
};

export default async function initiatePaystackPayment(
  email: string,
  plan: keyof typeof PAYMENT_PLANS
) {
  const { code, amount } = PAYMENT_PLANS[plan];

  const response = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    {
      email: email,
      currency: "NGN",
      amount: amount,
      plan: "PLN_enptoum7q4uz8kg",
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
