require('dotenv').config();

const mongoose = require('mongoose');
const Product = require('./models/product.model');

const products = [
  {
    name: 'Wireless Headphones',
    description: 'Over-ear Bluetooth headphones with rich sound and a comfortable fit.',
    price: 89.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85',
    stock: 24
  },
  {
    name: 'Everyday Canvas Tote',
    description: 'A sturdy, roomy cotton tote for daily errands and weekend outings.',
    price: 28.5,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85',
    stock: 40
  },
  {
    name: 'The Creative Habit',
    description: 'A practical guide to building a consistent and rewarding creative practice.',
    price: 18.99,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1200&q=85',
    stock: 16
  },
  {
    name: 'Stoneware Coffee Set',
    description: 'Two handmade-look ceramic cups with a softly speckled glaze.',
    price: 36,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    stock: 12
  },
  {
    name: 'Compact Digital Camera',
    description: 'A pocket-sized point-and-shoot camera for capturing everyday moments.',
    price: 149.95,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=85',
    stock: 8
  },
  {
    name: 'Linen Blend Shirt',
    description: 'A relaxed, breathable button-up made for warm days and easy layering.',
    price: 54,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=85',
    stock: 19
  },
  {
    name: 'Leather Minimalist Watch',
    description: 'A refined analog watch with a clean dial and genuine leather strap.',
    price: 120,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85',
    stock: 14
  },
  {
    name: 'Ceramic Plant Pot',
    description: 'A smooth, neutral ceramic planter for bringing greenery indoors.',
    price: 24.5,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=85',
    stock: 25
  },
  {
    name: 'Wireless Noise-Canceling Earbuds',
    description: 'Compact wireless earbuds with active noise cancellation and a charging case.',
    price: 89.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=1200&q=85',
    stock: 30
  },
  {
    name: 'Premium Linen Notebook',
    description: 'A cloth-bound notebook with smooth pages for notes, plans, and sketches.',
    price: 15,
    category: 'Stationery',
    image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=1200&q=85',
    stock: 50
  },
  {
    name: 'Gold Plated Necklace',
    description: 'A delicate gold-plated chain necklace with a polished, everyday finish.',
    price: 68,
    category: 'Jewelry',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=85',
    stock: 18
  },
  {
    name: 'Diamond Stud Earrings',
    description: 'Classic round-cut diamond studs in a minimal setting for understated sparkle.',
    price: 245,
    category: 'Jewelry',
    image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1200&q=85',
    stock: 10
  },
  {
    name: 'Minimalist Silver Bracelet',
    description: 'A sleek sterling-silver bracelet with a fine profile and adjustable clasp.',
    price: 52,
    category: 'Jewelry',
    image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=85',
    stock: 22
  },
  {
    name: 'Gemstone Ring',
    description: 'A vivid gemstone ring in a refined setting, designed to stand out on its own.',
    price: 135,
    category: 'Jewelry',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=85',
    stock: 7
  },
  {
    name: 'Plush Teddy Bear',
    description: 'A soft, cuddly teddy bear with a sweet face and fluffy golden fur.',
    price: 24.99,
    category: 'Toys',
    image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=1200&q=85',
    stock: 32,
    badge: '🧸 Cute Choice'
  },
  {
    name: 'Wooden Building Blocks',
    description: 'A colorful set of smooth wooden blocks for little builders and big ideas.',
    price: 29.99,
    category: 'Toys',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1200&q=85',
    stock: 21,
    badge: '🧸 Cute Choice'
  },
  {
    name: 'Iron Man Mark 85 with Arc Reactor',
    description: 'A detailed Iron Man Mark 85 collectible figure with a glowing-style Arc Reactor display.',
    price: 59.99,
    category: 'Marvel',
    image: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&w=1200&q=85',
    stock: 14,
    badge: '🔥 Best Seller'
  },
  {
    name: 'Spider-Man Poseable Figure',
    description: 'A poseable Spider-Man figure ready for web-slinging action and shelf display.',
    price: 34.99,
    category: 'Marvel',
    image: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&w=1200&q=85',
    stock: 18,
    badge: '🕷️ Fan Favorite'
  },
  {
    name: 'Kawaii Boba Milk Tea Keychain',
    description: 'A tiny smiling boba tea charm with pastel details for bags, keys, and backpacks.',
    price: 9.99,
    category: 'Keychains',
    image: 'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=1200&q=85',
    stock: 45,
    badge: '🧋 Trending'
  },
  {
    name: 'Plush Astronaut Charm',
    description: 'A pocket-sized plush astronaut charm ready to tag along on every little adventure.',
    price: 12.99,
    category: 'Keychains',
    image: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=1200&q=85',
    stock: 27,
    badge: '🧸 Cute Choice'
  },
  {
    name: 'Relaxed Cotton T-Shirt',
    description: 'A soft, easy-fit cotton tee for everyday layering and weekend wear.',
    price: 32,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=85',
    stock: 28
  }
];

async function seedProducts() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be set in the backend .env file before seeding.');
  }

  await mongoose.connect(process.env.MONGO_URI);

  const operations = products.map((product) => ({
    updateOne: {
      filter: { name: product.name },
      update: { $set: product },
      upsert: true
    }
  }));

  await Product.bulkWrite(operations);
  console.log(`Seeded ${products.length} products.`);
}

if (require.main === module) {
  seedProducts()
    .catch((error) => {
      console.error('Product seeding failed:', error.message);
      process.exitCode = 1;
    })
    .finally(async () => {
      await mongoose.disconnect();
    });
}

module.exports = { products };