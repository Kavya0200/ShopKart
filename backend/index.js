const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Product = require('./models/product.model');
const { products } = require('./seed');
require('dotenv').config();

const app = express();
let server;

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception in ShopKart backend:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection in ShopKart backend:', reason);
});

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
]);
const isDevelopment = process.env.NODE_ENV !== 'production';
const isLoopbackOrigin = (origin) => {
  try {
    const { hostname, protocol } = new URL(origin);
    return ['http:', 'https:'].includes(protocol) && ['localhost', '127.0.0.1'].includes(hostname);
  } catch {
    return false;
  }
};
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin) || (isDevelopment && isLoopbackOrigin(origin))) {
      return callback(null, true);
    }
    return callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
};

const listenOnAvailablePort = (port) => new Promise((resolve, reject) => {
  const httpServer = http.createServer(app);
  httpServer.once('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      const nextPort = port + 1;
      console.warn(`Port ${port} is already in use; trying port ${nextPort}.`);
      resolve(listenOnAvailablePort(nextPort));
      return;
    }
    reject(error);
  });
  httpServer.listen(port, () => {
    httpServer.removeAllListeners('error');
    console.log(`Server running on port ${httpServer.address().port}`);
    resolve(httpServer);
  });
});

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// Auth Routes
const authRoutes = require('./routes/customer.routes');
app.use('/customers', authRoutes);

const wishlistRoutes = require('./routes/wishlist.routes');
app.use('/wishlist', wishlistRoutes);

const cartRoutes = require('./routes/cart.routes');
app.use('/cart', cartRoutes);

const orderRoutes = require('./routes/order.routes');
app.use('/orders', orderRoutes);

// Product Routes (Lab 03)
const productRoutes = require('./routes/product.routes');
app.use('/products', productRoutes);

const startServer = async () => {
  try {
    const mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    console.log('MongoDB Connected (In-Memory Mode)');

    const productOperations = products.map((product) => ({
      updateOne: {
        filter: { name: product.name },
        update: { $set: product },
        upsert: true
      }
    }));
    await Product.bulkWrite(productOperations);
    console.log(`Seeded or updated ${products.length} sample products.`);

    const PORT = Number(process.env.PORT) || 4000;
    server = await listenOnAvailablePort(PORT);
  } catch (err) {
    console.error('Database Connection Error:', err);
    process.exitCode = 1;
  }
};

startServer();