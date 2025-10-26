// Test script to verify referral and theme system functionality
import mongoose from 'mongoose';
import { User, Referral, Theme, connectDB } from './lib/mongodb.js';
import { nanoid } from 'nanoid';

async function testSystems() {
  try {
    console.log('🧪 Testing Systems...\n');

    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Test 1: Check if we can generate unique referral codes
    console.log('\n📝 Test 1: Referral Code Generation');
    let referralCode;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      referralCode = nanoid(8).toUpperCase();
      const existingUser = await User.findOne({ referralCode });
      if (!existingUser) {
        isUnique = true;
      }
      attempts++;
    } while (!isUnique && attempts < maxAttempts);

    if (isUnique) {
      console.log(`✅ Generated unique referral code: ${referralCode}`);
    } else {
      console.log('❌ Failed to generate unique referral code');
    }

    // Test 2: Check referral leaderboard aggregation
    console.log('\n🏆 Test 2: Referral Leaderboard');
    try {
      const leaderboard = await User.aggregate([
        {
          $match: { referralCount: { $gt: 0 } }
        },
        {
          $project: {
            username: 1,
            referralCount: 1
          }
        },
        {
          $sort: { referralCount: -1 }
        },
        {
          $limit: 10
        }
      ]);

      console.log(`✅ Leaderboard aggregation works. Found ${leaderboard.length} users with referrals`);
      console.log('Top referrers:', leaderboard.slice(0, 3).map(u => `${u.username}: ${u.referralCount}`));
    } catch (error) {
      console.log('❌ Leaderboard aggregation failed:', error.message);
    }

    // Test 3: Check theme system
    console.log('\n🎨 Test 3: Theme System');
    try {
      const themes = await Theme.find({ isActive: true }).limit(5);
      console.log(`✅ Found ${themes.length} active themes`);

      if (themes.length > 0) {
        const firstTheme = themes[0];
        console.log(`Sample theme: ${firstTheme.name}`);
        console.log(`Theme has colors: ${!!firstTheme.themeFile?.colors}`);
        console.log(`Theme has fonts: ${!!firstTheme.themeFile?.fonts}`);

        // Test CSS variable extraction
        if (firstTheme.themeFile?.colors) {
          const colorKeys = Object.keys(firstTheme.themeFile.colors);
          console.log(`Color variables: ${colorKeys.join(', ')}`);
        }

        if (firstTheme.themeFile?.fonts) {
          const fontKeys = Object.keys(firstTheme.themeFile.fonts);
          console.log(`Font variables: ${fontKeys.join(', ')}`);
        }
      }
    } catch (error) {
      console.log('❌ Theme system test failed:', error.message);
    }

    // Test 4: Check if User model has all required fields
    console.log('\n📊 Test 4: Database Schema');
    const userFields = Object.keys(User.schema.paths);
    const requiredFields = ['referralCode', 'referredBy', 'referralCount', 'theme'];

    const missingFields = requiredFields.filter(field => !userFields.includes(field));
    if (missingFields.length === 0) {
      console.log('✅ User model has all required fields');
    } else {
      console.log('❌ Missing fields in User model:', missingFields);
    }

    // Test 5: Verify Transaction model supports referral rewards
    console.log('\n💰 Test 5: Transaction Model');
    try {
      const transactionFields = Object.keys(mongoose.models.Transaction.schema.paths);
      const typeField = transactionFields.find(field => field === 'type');

      if (typeField) {
        const transactionSchema = mongoose.models.Transaction.schema;
        const typeEnum = transactionSchema.path('type').enumValues;
        if (typeEnum.includes('referral_reward')) {
          console.log('✅ Transaction model supports referral_reward type');
        } else {
          console.log('❌ Transaction model missing referral_reward type');
        }
      }
    } catch (error) {
      console.log('❌ Transaction model test failed:', error.message);
    }

    // Test 6: Check Referral model
    console.log('\n🔗 Test 6: Referral Model');
    try {
      const referralFields = Object.keys(Referral.schema.paths);
      const requiredReferralFields = ['referrerId', 'refereeId', 'status', 'rewardType'];

      const missingReferralFields = requiredReferralFields.filter(field => !referralFields.includes(field));
      if (missingReferralFields.length === 0) {
        console.log('✅ Referral model has all required fields');
      } else {
        console.log('❌ Missing fields in Referral model:', missingReferralFields);
      }
    } catch (error) {
      console.log('❌ Referral model test failed:', error.message);
    }

    console.log('\n🎉 All Systems Test Complete!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testSystems();