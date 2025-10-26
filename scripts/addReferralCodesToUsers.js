import mongoose from 'mongoose';
import { User } from '../lib/mongodb';
import { nanoid } from 'nanoid';

async function addReferralCodesToUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/spelinx');

    const usersWithoutCodes = await User.find({ referralCode: { $exists: false } });

    for (const user of usersWithoutCodes) {
      user.referralCode = nanoid(8).toUpperCase();
      await user.save();
      console.log(`Updated user ${user.username} with referral code: ${user.referralCode}`);
    }

    console.log(`Updated ${usersWithoutCodes.length} users with referral codes`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating referral codes:', error);
    process.exit(1);
  }
}

addReferralCodesToUsers();