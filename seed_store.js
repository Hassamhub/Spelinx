// Load environment variables
require('dotenv').config();

const mongoose = require('mongoose');

// Define Mongoose schemas
const StoreItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number },
  discountPercentage: { type: Number, min: 0, max: 100 },
  discountExpiry: { type: Date },
  category: {
    type: String,
    enum: ['skins', 'themes', 'avatars', 'premium'],
    required: true
  },
  image: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create model
const StoreItem = mongoose.models.StoreItem || mongoose.model('StoreItem', StoreItemSchema);

// Database connection
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/spelinx';

async function connectDB() {
  try {
    if (mongoose.connection.readyState >= 1) {
      return;
    }

    const options = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(MONGODB_URI, options);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error(`Database connection failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function seedStoreItems() {
  try {
    await connectDB();

    // Sample store items
    const sampleItems = [
      // Themes
      {
        name: 'Dark Nebula Theme',
        description: 'A sleek dark theme with purple accents for a cosmic gaming experience.',
        price: 299,
        originalPrice: 499,
        discountPercentage: 40,
        category: 'themes',
        image: '/themes/dark-nebula.jpg',
        isActive: true
      },
      {
        name: 'Cyber Green Theme',
        description: 'Futuristic green theme with neon highlights for intense gaming sessions.',
        price: 199,
        originalPrice: 299,
        discountPercentage: 33,
        category: 'themes',
        image: '/themes/cyber-green.jpg',
        isActive: true
      },
      {
        name: 'Ocean Blue Theme',
        description: 'Calming blue theme inspired by the ocean depths.',
        price: 149,
        category: 'themes',
        image: '/themes/ocean-blue.jpg',
        isActive: true
      },
      // Avatars
      {
        name: 'Warrior Avatar',
        description: 'Epic warrior avatar with armor and sword for battle-ready gamers.',
        price: 199,
        originalPrice: 299,
        discountPercentage: 33,
        category: 'avatars',
        image: '/avatars/warrior.jpg',
        isActive: true
      },
      {
        name: 'Mage Avatar',
        description: 'Mystical mage avatar with magical staff and robes.',
        price: 249,
        originalPrice: 399,
        discountPercentage: 38,
        category: 'avatars',
        image: '/avatars/mage.jpg',
        isActive: true
      },
      {
        name: 'Ninja Avatar',
        description: 'Stealthy ninja avatar for silent and deadly gameplay.',
        price: 179,
        category: 'avatars',
        image: '/avatars/ninja.jpg',
        isActive: true
      },
      // Skins
      {
        name: 'Golden Skin',
        description: 'Premium golden skin that makes your interface shine.',
        price: 499,
        originalPrice: 699,
        discountPercentage: 29,
        category: 'skins',
        image: '/skins/golden.jpg',
        isActive: true
      },
      {
        name: 'Neon Glow Skin',
        description: 'Vibrant neon glow skin for a retro gaming feel.',
        price: 399,
        originalPrice: 599,
        discountPercentage: 33,
        category: 'skins',
        image: '/skins/neon-glow.jpg',
        isActive: true
      },
      // Premium
      {
        name: 'Premium Monthly',
        description: 'Monthly premium subscription with exclusive features.',
        price: 499,
        category: 'premium',
        image: '/premium/monthly.jpg',
        isActive: true
      },
      {
        name: 'Premium Yearly',
        description: 'Yearly premium subscription with maximum savings.',
        price: 3999,
        originalPrice: 5000,
        discountPercentage: 20,
        category: 'premium',
        image: '/premium/yearly.jpg',
        isActive: true
      }
    ];

    // Insert sample items
    await StoreItem.insertMany(sampleItems);
    console.log('Sample store items inserted successfully!');

  } catch (error) {
    console.error('Error seeding store items:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

// Run the seed function
seedStoreItems();