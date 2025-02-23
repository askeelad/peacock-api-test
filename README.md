# Stripe Subscription Payment API

This project is an Express.js API that integrates **Stripe Checkout** for subscription payments. It supports webhook handling for post-payment processing.

## 🚀 Features
- Create Stripe Checkout Sessions for subscription payments.
- Handle Stripe webhooks to process payment events.
- Use **Stripe CLI** to test webhooks locally.

---

## 📌 Prerequisites
Make sure you have the following installed:

- **Node.js** (v14+ recommended)
- **npm** or **yarn**
- **Stripe Account** ([Sign up](https://stripe.com))
- **Stripe CLI** (for local webhook testing)

---

## 🛠️ Installation

1️⃣ **Clone the repository**
```sh
git clone https://github.com/your-repo/stripe-subscription-api.git
cd stripe-subscription-api
```

2️⃣ **Install dependencies**
```sh
npm install
# or
yarn install
```

3️⃣ **Set up environment variables**
Create a `.env` file in the root directory and add:

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_PRICE_ID=price_your_price_id
CLIENT_URL=http://localhost:3000
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

Replace `your_secret_key`, `your_price_id`, and `your_webhook_secret` with values from your **Stripe Dashboard**.

---

## 🚦 Running the Server
Start the Express server:
```sh
npm run dev  # If using nodemon
# or
node app.js
```

By default, the server runs on **http://localhost:3000**.

---

## 💳 Creating a Checkout Session
**Endpoint:** `POST /api/payment/premium`

This creates a Stripe Checkout Session for a subscription payment.

```sh
curl -X POST http://localhost:3000/api/payment/premium \
     -H "Content-Type: application/json" \
     -d '{}'
```

✅ **Response:**
```json
{
  "sessionId": "cs_test_123456789"
}
```

Redirect the user to:
```
https://checkout.stripe.com/pay/cs_test_123456789
```

---

## 🔔 Handling Stripe Webhooks
Stripe sends **webhook events** when payments succeed or fail.

**Webhook URL:** `POST /webhook`

### 📌 Webhook Setup in Express
Modify `routes/webhook.js`:
```javascript
const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const router = express.Router();
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post("/", express.raw({ type: "application/json" }), (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("✅ Webhook Event Received:", event.type);

  if (event.type === "checkout.session.completed") {
    console.log("🎉 Payment successful!", event.data.object);
  }

  res.json({ received: true });
});

module.exports = router;
```

---

## 🛠️ Testing Webhooks Locally
Since Stripe cannot reach `localhost`, use **Stripe CLI** to forward webhooks.

### 🔹 **Start Webhook Listener**
Run:
```sh
stripe listen --forward-to http://localhost:3000/webhook
```
This listens for Stripe events and forwards them to your local webhook.

### 🔹 **Trigger a Test Event**
```sh
stripe trigger checkout.session.completed
```
If everything is working, your webhook should log:
```
✅ Webhook Event Received: checkout.session.completed
🎉 Payment successful!
```

---

## 🚀 Deploying to Production
1. Deploy your **Express API** to a public server (e.g., **Vercel, Render, Heroku**).
2. Set up **live** Stripe API keys.
3. Configure webhooks in the **Stripe Dashboard**:
   - Go to **Developers → Webhooks**
   - Click **"Add Endpoint"**
   - Enter your **public URL** (e.g., `https://yourdomain.com/webhook`)
   - Select the events to listen for (e.g., `checkout.session.completed`)
   - Save the webhook.

---

## ❓ Troubleshooting

**1️⃣ Getting `Webhook Error: No signatures found`?**  
➡️ Ensure `express.raw({ type: "application/json" })` is used **before** `express.json()`.  
➡️ Restart the server after making changes.

**2️⃣ Webhooks are not reaching localhost?**  
➡️ Run `stripe listen --forward-to http://localhost:3000/webhook`.

**3️⃣ Checkout session not creating?**  
➡️ Check if `STRIPE_SECRET_KEY` and `STRIPE_PRICE_ID` are set correctly.

---

## 👨‍💻 Author
Created by [Your Name](https://github.com/your-github).

---

## 📜 License
This project is licensed under the MIT License.

