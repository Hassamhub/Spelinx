const mongoose = require('mongoose');
const { User } = require('../lib/mongodb');

async function seedDefaultAvatar() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/spelinx');

    const usersWithoutAvatar = await User.find({ avatar: { $exists: false } });

    for (const user of usersWithoutAvatar) {
      user.avatar = '/assets/default-avatar.svg';
      await user.save();
      console.log(`Updated user ${user.username} with default avatar`);
    }

    console.log(`Updated ${usersWithoutAvatar.length} users with default avatars`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding default avatars:', error);
    process.exit(1);
  }
}

seedDefaultAvatar();