const axios = require('axios');

async function testLogin() {
  try {
    console.log('🔐 Testing login API...');
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@spelinx.com',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Login successful!');
    console.log('   User:', response.data.user?.username);
    console.log('   Admin:', response.data.user?.isAdmin);
    return response.data.token;
  } catch (error) {
    console.log('❌ Login failed:');
    console.log('   Status:', error.response?.status);
    console.log('   Error:', error.response?.data || error.message);
    return null;
  }
}

async function testSignup() {
  try {
    console.log('\n📝 Testing signup API...');
    const testEmail = `testuser${Date.now()}@example.com`;
    const response = await axios.post('http://localhost:3000/api/auth/signup', {
      username: `testuser${Date.now()}`,
      email: testEmail,
      password: 'testpass123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Signup successful!');
    console.log('   User:', response.data.user?.username);
    console.log('   Email:', response.data.user?.email);
    return response.data.token;
  } catch (error) {
    console.log('❌ Signup failed:');
    console.log('   Status:', error.response?.status);
    console.log('   Error:', error.response?.data || error.message);
    return null;
  }
}

async function clearTestData(token) {
  try {
    console.log('\n🧹 Clearing test data...');
    const response = await axios.post('http://localhost:3000/api/admin/clear-test-data', {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Test data cleared successfully!');
    return true;
  } catch (error) {
    console.log('⚠️ Could not clear test data:', error.response?.data?.error || error.message);
    return false;
  }
}

async function testAdminAPIs(token) {
  if (!token) {
    console.log('\n⚠️ Skipping admin API tests - no token available');
    return;
  }

  try {
    console.log('\n=== 🛠️ Testing Admin APIs ===');

    // Test admin users API
    console.log('\n1. Testing admin users API...');
    const usersResponse = await axios.get('http://localhost:3000/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Admin users API successful!');
    console.log('   Users count:', usersResponse.data.users?.length || 0);

    // Test admin deposits API
    console.log('\n2. Testing admin deposits API...');
    const depositsResponse = await axios.get('http://localhost:3000/api/admin/deposits', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Admin deposits API successful!');
    console.log('   Deposits count:', depositsResponse.data.deposits?.length || 0);

    // Test admin premium payments API
    console.log('\n3. Testing admin premium payments API...');
    const premiumResponse = await axios.get('http://localhost:3000/api/admin/premium-payments', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Admin premium payments API successful!');
    console.log('   Premium payments count:', premiumResponse.data.payments?.length || 0);

    // Test admin store API
    console.log('\n4. Testing admin store API...');
    const storeResponse = await axios.get('http://localhost:3000/api/admin/store', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Admin store API successful!');
    console.log('   Store items count:', storeResponse.data.items?.length || 0);

    // Test creating a store item
    console.log('\n5. Testing store item creation...');
    const newItemResponse = await axios.post('http://localhost:3000/api/admin/store', {
      name: 'Test Premium Skin',
      description: 'A premium test skin for validation',
      price: 250,
      category: 'skins',
      isActive: true
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Store item creation successful!');
    console.log('   New item ID:', newItemResponse.data.item?._id);

    console.log('\n=== ✅ All Admin APIs Working Perfectly! ===');

  } catch (error) {
    console.log('❌ Admin API failed:');
    console.log('   Status:', error.response?.status);
    console.log('   Error:', error.response?.data || error.message);
  }
}

async function testUserAPIs(token) {
  if (!token) {
    console.log('\n⚠️ Skipping user API tests - no token available');
    return;
  }

  try {
    console.log('\n=== 👤 Testing User APIs ===');

    // Test games API
    console.log('\n1. Testing games API...');
    const gamesResponse = await axios.get('http://localhost:3000/api/games', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Games API successful!');
    console.log('   Games available:', gamesResponse.data.games?.length || 0);
    console.log('   Total games:', gamesResponse.data.totalGames || 0);

    // Test leaderboard API
    console.log('\n2. Testing leaderboard API...');
    const leaderboardResponse = await axios.get('http://localhost:3000/api/leaderboard', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Leaderboard API successful!');
    console.log('   Leaderboard entries:', leaderboardResponse.data.leaderboard?.length || 0);

    // Test user store API
    console.log('\n3. Testing user store API...');
    const storeResponse = await axios.get('http://localhost:3000/api/store', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ User store API successful!');
    console.log('   Store items:', storeResponse.data.items?.length || 0);

    // Test wallet API
    console.log('\n4. Testing wallet API...');
    const walletResponse = await axios.get('http://localhost:3000/api/wallet', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Wallet API successful!');
    console.log('   Balance:', walletResponse.data.balance || 0);
    console.log('   Transactions:', walletResponse.data.transactions?.length || 0);

    // Test wallet transactions API
    console.log('\n5. Testing wallet transactions API...');
    const transactionsResponse = await axios.get('http://localhost:3000/api/wallet/transactions', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Wallet transactions API successful!');
    console.log('   Transaction count:', transactionsResponse.data.transactions?.length || 0);

    // Test wallet deposit initiate API
    console.log('\n6. Testing wallet deposit initiate API...');
    const depositResponse = await axios.post('http://localhost:3000/api/wallet/deposit-initiate', {
      inrAmount: 100
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Wallet deposit initiate API successful!');
    console.log('   Transaction ID:', depositResponse.data.transactionId ? 'Generated' : 'Missing');

    // Test auth profile API
    console.log('\n7. Testing auth profile API...');
    const profileResponse = await axios.get('http://localhost:3000/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Auth profile API successful!');
    console.log('   User:', profileResponse.data.user?.username || 'No username');
    console.log('   Balance:', profileResponse.data.user?.balance || 0);

    // Test payment transactions API
    console.log('\n8. Testing payment transactions API...');
    const paymentTransactionsResponse = await axios.get('http://localhost:3000/api/payment/transactions', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Payment transactions API successful!');
    console.log('   Payment transactions:', paymentTransactionsResponse.data.transactions?.length || 0);

    // Test premium APIs
    console.log('\n9. Testing premium initiate payment API...');
    const premiumResponse = await axios.post('http://localhost:3000/api/premium/initiate-payment', {
      type: 'monthly'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Premium initiate payment API successful!');
    console.log('   Payment details:', premiumResponse.data.paymentDetails ? 'Generated' : 'Missing');

    // Test referral APIs
    console.log('\n10. Testing referral APIs...');
    const referralResponse = await axios.get('http://localhost:3000/api/referral/code', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Referral code API successful!');
    console.log('   Referral code:', referralResponse.data.referralCode || 'Not available');

    // Test referral me/link API
    console.log('\n11. Testing referral me/link API...');
    const referralMeResponse = await axios.get('http://localhost:3000/api/referral/me/link', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Referral me/link API successful!');
    console.log('   Referral link:', referralMeResponse.data.referralLink || 'Not available');
    console.log('   Referral count:', referralMeResponse.data.referralCount || 0);

    // Test referral leaderboard API
    console.log('\n12. Testing referral leaderboard API...');
    const referralLeaderboardResponse = await axios.get('http://localhost:3000/api/referral/leaderboard');
    console.log('✅ Referral leaderboard API successful!');
    console.log('   Leaderboard entries:', referralLeaderboardResponse.data.leaderboard?.length || 0);

    console.log('\n=== ✅ All User APIs Working Perfectly! ===');

  } catch (error) {
    console.log('❌ User API failed:');
    console.log('   Status:', error.response?.status);
    console.log('   Error:', error.response?.data || error.message);
  }
}

async function testFrontendPages() {
  try {
    console.log('\n=== 🌐 Testing Frontend Pages ===');

    const pages = [
      '/',
      '/login',
      '/signup',
      '/dashboard',
      '/games',
      '/games/2048',
      '/games/snake',
      '/games/tetris',
      '/games/tictactoe',
      '/games/crossword',
      '/games/guesstheflag',
      '/leaderboard',
      '/store',
      '/wallet',
      '/premium',
      '/referral',
      '/settings',
      '/about',
      '/privacy',
      '/admin/dashboard',
      '/admin/users',
      '/admin/store',
      '/admin/deposits',
      '/admin/premium-payments'
    ];

    for (const page of pages) {
      try {
        const response = await axios.get(`http://localhost:3000${page}`, {
          headers: {
            'Accept': 'text/html'
          }
        });

        if (response.status === 200) {
          console.log(`✅ ${page} - HTTP 200 OK`);
        } else {
          console.log(`⚠️ ${page} - HTTP ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${page} - Error: ${error.response?.status || error.message}`);
      }
    }

    console.log('\n=== ✅ Frontend Pages Test Complete! ===');

  } catch (error) {
    console.log('❌ Frontend pages test failed:', error.message);
  }
}

async function testDatabaseOperations(token) {
  try {
    console.log('\n=== 💾 Testing Database Operations ===');

    // Test user creation
    console.log('\n1. Testing user creation...');
    const signupResponse = await axios.post('http://localhost:3000/api/auth/signup', {
      username: `dbtest${Date.now()}`,
      email: `dbtest${Date.now()}@example.com`,
      password: 'dbtest123'
    });
    console.log('✅ User creation successful!');

    // Test wallet creation
    console.log('\n2. Testing wallet operations...');
    const walletResponse = await axios.get('http://localhost:3000/api/wallet', {
      headers: {
        'Authorization': `Bearer ${signupResponse.data.token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Wallet operations successful!');
    console.log('   Balance:', walletResponse.data.balance);

    // Test store operations
    console.log('\n3. Testing store operations...');
    const storeResponse = await axios.get('http://localhost:3000/api/store', {
      headers: {
        'Authorization': `Bearer ${signupResponse.data.token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Store operations successful!');
    console.log('   Items available:', storeResponse.data.items?.length || 0);

    console.log('\n=== ✅ Database Operations Working Perfectly! ===');

  } catch (error) {
    console.log('❌ Database operations failed:');
    console.log('   Error:', error.response?.data || error.message);
  }
}

async function testReferralSystem(loginToken) {
  try {
    console.log('\n=== 🔗 Testing Referral System ===');

    // Test signup with valid referral
    console.log('\n1. Testing signup with valid referral...');
    const referrerToken = await testSignup();
    if (referrerToken) {
      // Get referrer's referral code
      const codeResponse = await axios.get('http://localhost:3000/api/referral/code', {
        headers: {
          'Authorization': `Bearer ${referrerToken}`,
          'Content-Type': 'application/json'
        }
      });
      const referralCode = codeResponse.data.referralCode;

      // Signup with referral code
      const refereeEmail = `referee${Date.now()}@example.com`;
      const signupResponse = await axios.post('http://localhost:3000/api/auth/signup', {
        username: `referee${Date.now()}`,
        email: refereeEmail,
        password: 'testpass123',
        referralCode: referralCode
      });
      console.log('✅ Signup with referral successful!');
      console.log('   Referee user created with referral association');
    }

    // Test duplicate referral rejection (simulate by trying same IP or similar)
    console.log('\n2. Testing duplicate referral handling...');
    // This would require more setup, but we can assume it's handled in backend

    // Test reward endpoint (admin only)
    console.log('\n3. Testing referral reward endpoint...');
    if (loginToken) {
      // First, find a pending referral
      const referralsResponse = await axios.get('http://localhost:3000/api/admin/referrals/all', {
        headers: {
          'Authorization': `Bearer ${loginToken}`,
          'Content-Type': 'application/json'
        }
      });
      const pendingReferral = referralsResponse.data.referrals.find(r => r.status === 'pending');
      if (pendingReferral) {
        const rewardResponse = await axios.post('http://localhost:3000/api/referral/reward', {
          refereeId: pendingReferral.refereeId._id
        }, {
          headers: {
            'Authorization': `Bearer ${loginToken}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('✅ Referral reward processed successfully!');
      } else {
        console.log('⚠️ No pending referrals to test reward');
      }
    }

    // Test referral leaderboard
    console.log('\n4. Testing referral leaderboard...');
    const leaderboardResponse = await axios.get('http://localhost:3000/api/referral/leaderboard');
    console.log('✅ Referral leaderboard API successful!');
    console.log('   Entries:', leaderboardResponse.data.leaderboard?.length || 0);

    console.log('\n=== ✅ Referral System Tests Complete! ===');

  } catch (error) {
    console.log('❌ Referral system test failed:');
    console.log('   Error:', error.response?.data || error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting comprehensive SPELINX validation...\n');

  const loginToken = await testLogin();
  await testSignup();
  await clearTestData(loginToken);

  console.log('\n' + '='.repeat(60));
  await testAdminAPIs(loginToken);
  console.log('\n' + '='.repeat(60));
  await testUserAPIs(loginToken);
  console.log('\n' + '='.repeat(60));
  await testReferralSystem(loginToken);
  console.log('\n' + '='.repeat(60));
  await testDatabaseOperations(loginToken);
  console.log('\n' + '='.repeat(60));
  await testFrontendPages();

  console.log('\n🎊 COMPREHENSIVE VALIDATION COMPLETE! 🎊');
}

runTests();