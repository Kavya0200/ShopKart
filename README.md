# ShopKart

ShopKart is a fullstack e-commerce demo with a boutique-inspired storefront, secure customer accounts, a dynamic product catalog, interactive cart and wishlist experiences, and Razorpay checkout. The React application talks to an Express API backed by Mongoose models. Payments use Razorpay Test Mode, with payment signatures verified by the server using HMAC SHA-256 before an order is marked paid.

## Features

- **Authentication and authorization:** Register and sign in to access protected customer workflows. JWTs are issued in an HTTP-only cookie, and backend middleware verifies protected requests. Customer records use bcrypt password hashing.
- **Boutique UI:** A warm pastel palette centered on `#FAF8F5`, glass-like product surfaces, responsive layouts, subtle hover and loading interactions, category badges, floating toast notifications, and illustrated empty states.
- **Product discovery:** Search, category filtering, and sorting across a seeded catalog of 21 products, including Jewelry, Toys, Marvel, Keychains, Electronics, Fashion, and other categories.
- **Cart and wishlist:** Add and remove products, adjust cart quantities, and manage customer-specific saved items. Cart and wishlist actions require an authenticated customer.
- **Orders and checkout:** Enter shipping details, create a Razorpay order, complete checkout in the Razorpay modal, and verify the returned signature on the backend before the order is placed.
- **Development data:** On startup, the backend seeds or updates the sample catalog. Its default in-memory MongoDB database is convenient for local development and resets when the process stops.

## Architecture and technology

| Area | Technologies |
| --- | --- |
| Frontend | React 19, React Router, Vite, Axios, CSS3 |
| UI behavior | CSS glassmorphism and transitions, event-based toast bus |
| Backend | Node.js, Express 5, Mongoose |
| Data | MongoDB Memory Server by default; MongoDB can also be used by the standalone seed script |
| Security | JWT, HTTP-only cookies, bcrypt password hashing, protected API routes |
| Payments | Razorpay Node SDK, Razorpay Checkout, HMAC SHA-256 signature verification |

### Project structure

```text
ShopKart/
├── backend/
│   ├── config/             # Razorpay client configuration
│   ├── controllers/        # Customer, product, cart, wishlist, and order logic
│   ├── middlewares/        # Authentication and route protection
│   ├── models/             # Mongoose customer, product, and order models
│   ├── routes/             # Express API route definitions
│   ├── utils/              # JWT creation and cookie setup
│   ├── index.js            # Express app, in-memory DB startup, and catalog seeding
│   ├── seed.js             # Sample catalog and optional persistent-DB seed script
│   └── package.json
└── frontend/
    ├── public/             # Static public assets
    ├── src/
    │   ├── api.js          # Axios API client and endpoint helpers
    │   ├── App.jsx         # App routes and shared toast viewport
    │   ├── *.jsx           # Catalog, auth, cart, checkout, orders, and UI components
    │   ├── toastBus.js     # Event-based notification dispatch
    │   ├── App.css
    │   └── index.css       # Global styles and design tokens
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Prerequisites

- Node.js **20.19+** or **22.12+** (required by the Vite version in this project)
- npm
- Internet access for downloading Razorpay Checkout and for Razorpay Test Mode
- No local MongoDB installation is required for the default backend startup

## Configuration

Create `backend/.env` with the following values. Use Razorpay **Test Mode** API credentials while developing; never commit real secrets.

```dotenv
PORT=4000
NODE_ENV=development
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRE=7d
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
```

`PORT`, `NODE_ENV`, and `JWT_EXPIRE` are optional; the shown values are suitable for local development. `JWT_SECRET`, `RAZORPAY_KEY_ID`, and `RAZORPAY_KEY_SECRET` must be configured for authentication and checkout. The frontend API client currently targets `http://localhost:4000`, so keep port 4000 available. The backend may try the next port if 4000 is occupied, but the frontend API URL must then be updated to match.

The standard backend process uses `mongodb-memory-server`; it does not read `MONGO_URI` and its data is not durable. The separate `npm run seed` command connects to `MONGO_URI` to seed a persistent MongoDB database. For the default local workflow, do not run that command: `npm start` seeds its own in-memory catalog automatically.

## Run locally

Open two terminals from the `ShopKart` directory.

**1. Install backend dependencies and start the API:**

```bash
cd backend
npm install
npm start
```

The API listens at `http://localhost:4000`. Startup creates the in-memory database and seeds or updates the sample products. The database, including registered accounts, carts, wishlists, and orders, is cleared when the backend process exits.

**2. Install frontend dependencies and start Vite:**

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

For frontend production-build and lint checks, run these from `frontend/`:

```bash
npm run build
npm run lint
```

## Test a Razorpay checkout

1. Add the Razorpay Test Mode `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to `backend/.env`, then restart the backend.
2. Start the frontend and backend, register a ShopKart account, and sign in.
3. Add one or more catalog items to the cart and continue to checkout.
4. Enter all shipping fields. The phone number must contain 10 digits and the pincode 6 digits.
5. Select **Pay with Razorpay**. Use a payment method and test credentials supported by your Razorpay account's Test Mode. See Razorpay's [Test Cards and UPI documentation](https://razorpay.com/docs/payments/payments/test-card-upi-details/) for current test payment details.
6. After the test payment completes, the frontend sends Razorpay's order ID, payment ID, and signature to the API. The backend recomputes the HMAC SHA-256 signature with `RAZORPAY_KEY_SECRET` and compares it before marking the order as paid. A successful verification takes you to the order confirmation page and clears the cart.

Razorpay credentials are required to create a payment order. Without them, the API returns a configuration error and checkout cannot proceed. Do not use live payment credentials for local testing.