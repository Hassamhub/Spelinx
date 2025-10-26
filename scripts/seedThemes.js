import mongoose from 'mongoose';
import { connectDB, Theme } from '../lib/mongodb.js';

async function seedThemes() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/spelinx');

    const themes = [
      {
        name: 'Gold Theme',
        description: 'A premium gold-themed design with elegant colors',
        price: 499,
        scope: 'full_site',
        previewUrl: '/assets/gold-theme-preview.png',
        themeFile: {
          colors: {
            '--background': '#1A1A1A',
            '--foreground': '#FFFFFF',
            '--primary': '#FFD700',
            '--secondary': '#FFA500',
            '--accent': '#FF6B35'
          },
          fonts: {
            '--font-family-base': 'Inter, sans-serif'
          }
        }
      },
      {
        name: 'Neon Theme',
        description: 'Vibrant neon colors for a futuristic look',
        price: 399,
        scope: 'full_site',
        previewUrl: '/assets/neon-theme-preview.png',
        themeFile: {
          colors: {
            '--background': '#0A0A0A',
            '--foreground': '#FFFFFF',
            '--primary': '#00FF41',
            '--secondary': '#FF0080',
            '--accent': '#00BFFF'
          },
          fonts: {
            '--font-family-base': 'Inter, sans-serif'
          }
        }
      }
    ];

    for (const themeData of themes) {
      const existingTheme = await Theme.findOne({ name: themeData.name });
      if (!existingTheme) {
        const theme = new Theme(themeData);
        await theme.save();
        console.log(`Created theme: ${theme.name}`);
      } else {
        console.log(`Theme already exists: ${themeData.name}`);
      }
    }

    console.log('Theme seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding themes:', error);
    process.exit(1);
  }
}

seedThemes();