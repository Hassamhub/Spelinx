const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login API...');
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@spelinx.com',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Login successful!');
    console.log('Response:', response.data);
    return response.data.token;
  } catch (error) {
    console.log('Login failed:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data || error.message);
    return null;
  }
}

async function testSignup() {
  try {
    console.log('\nTesting signup API...');
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

    console.log('Signup successful!');
    console.log('Response:', response.data);
    return response.data.token;
  } catch (error) {
    console.log('Signup failed:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data || error.message);
    return null;
  }
}

async function testAdminAPIs(token) {
  if (!token) {
    console.log('\nSkipping admin API tests - no token available');
    return;
  }

  try {
    console.log('\n=== Testing Admin APIs ===');

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
      name: 'Test Item',
      description: 'A test store item for validation',
      price: 100,
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

    console.log('\n=== All Admin APIs Working Perfectly! ===');

  } catch (error) {
    console.log('❌ Admin API failed:');
    console.log('   Status:', error.response?.status);
    console.log('   Error:', error.response?.data || error.message);
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

async function testNewAPIs(token) {
  if (!token) {
    console.log('\nSkipping new API tests - no token available');
    return;
  }

  try {
    console.log('\n=== Testing Newly Implemented APIs ===');

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
    console.log('   User rank:', leaderboardResponse.data.userRank || 'Not ranked');

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

    // Test wallet deposit initiate API (this should work after clearing data)
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

    console.log('\n=== All New APIs Working Perfectly! ===');

  } catch (error) {
    console.log('❌ New API failed:');
    console.log('   Status:', error.response?.status);
    console.log('   Error:', error.response?.data || error.message);
  }
}

async function runTests() {
  const loginToken = await testLogin();
  await testSignup();
  await clearTestData(loginToken); // Clear test data first
  await testAdminAPIs(loginToken);
  await testNewAPIs(loginToken);
}

runTests();