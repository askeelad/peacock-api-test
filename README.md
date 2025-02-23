# Stripe Subscription Payment API

This project is an Express.js API that integrates **Stripe Checkout** for subscription payments. It supports webhook handling for post-payment processing and uses JWT authentication with refresh token. It also fetches normal data from dummyjson and premium data from NewsAPI

## 🚀 Features

- Sign Up and login using passportJS.
- Handle authentication using jwt.

- Subscribe and Unsubscribe to category
- Retrieve content based on user's subscribed category
- Access to premium content

- Use **Stripe CLI** to test webhooks locally.
- Create Stripe Checkout Sessions for subscription payments.
- Handle Stripe webhooks to process payment events.

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
git clone https://github.com/askeelad/peacock-api-test.git
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
DATABASE_URL=""
JWT_SECRET=asgkaq-asdpoinmmaos-aspgz-dahq
REFRESH_TOKEN_SECRET=sdfoasdsdfhkjkjdsfnmyxv-asdasidgj
SESSION_EXPIRY=60*20
JWT_EXPIRY=60*20
REFRESH_TOKEN_EXPIRY=60*60
COOKIE_SECRET=jhdshhds884hfhhs-ew6dhjd
EXTERNAL_API_URL=https://dummyjson.com
EMAIL_USER=""
EMAIL_PASS=""
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""
STRIPE_PRICE_ID=""
STRIPE_WEBHOOK_SECRET=""
CLIENT_URL=https://dummyjson.com
```

Replace `your_secret_key`, `your_price_id`, and `your_webhook_secret` with values from your **Stripe Dashboard**.

---

## 🚦 Special instructions

---

## 🚦 Running the Server

Start the Express server:

```sh
npm run dev
```

By default, the server runs on **http://localhost:3000**.

## 🔔 Handling Stripe Webhooks

Stripe sends **webhook events** when payments succeed or fail.

**Webhook URL:** `localhost:3000/webhook/webhook`
** run stripe trigger checkout.session.completed to mock webhook event**

### 📌 API Endpoints

--localhost:3000/api/auth/signup(post) -- to sign up
--localhost:3000/api/auth/passport(post) --to login
--localhost:3000/api/auth/refreshtoken(get) --get token
--localhost:3000/api/subscription/unsubscribe/:id(post)(jwt) -- unsubscribe a category
--localhost:3000/api/subscription/subscribe/:id(post)(jwt) --sunbscribe to a category
--localhost:3000/api/content/feed(get)(jwt) --get content
--localhost:3000/api/content/premiumContent(get)(jwt) --get premium content
--localhost:3000/api/payment/premium(post)(jwt) --initiate payment
if you run it on locally make a req to this api to populate category data from dummyjson. Do it once only.
--localhost:3000/api/content/populateCategory

---

## 👨‍💻 Author

Created by KB.

---

## 📜 License

This project is licensed under the MIT License.
