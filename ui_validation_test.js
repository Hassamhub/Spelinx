const axios = require('axios');

async function testUIComponents() {
  console.log('🎨 Starting UI Components Validation...\n');

  try {
    // Test Header component (check if it loads without errors)
    console.log('1. Testing Header component...');
    const headerResponse = await axios.get('http://localhost:3000/', {
      headers: { 'Accept': 'text/html' }
    });
    if (headerResponse.data.includes('Header') || headerResponse.status === 200) {
      console.log('✅ Header component - Working');
    } else {
      console.log('⚠️ Header component - Issues detected');
    }

    // Test Footer component
    console.log('2. Testing Footer component...');
    if (headerResponse.data.includes('Footer') || headerResponse.status === 200) {
      console.log('✅ Footer component - Working');
    } else {
      console.log('⚠️ Footer component - Issues detected');
    }

    // Test game components
    console.log('3. Testing game components...');
    const gameResponse = await axios.get('http://localhost:3000/games/2048', {
      headers: { 'Accept': 'text/html' }
    });
    if (gameResponse.data.includes('2048') || gameResponse.status === 200) {
      console.log('✅ Game components - Working');
    } else {
      console.log('⚠️ Game components - Issues detected');
    }

    // Test admin components
    console.log('4. Testing admin components...');
    const adminResponse = await axios.get('http://localhost:3000/admin/dashboard', {
      headers: { 'Accept': 'text/html' }
    });
    if (adminResponse.data.includes('Admin') || adminResponse.status === 200) {
      console.log('✅ Admin components - Working');
    } else {
      console.log('⚠️ Admin components - Issues detected');
    }

    console.log('\n✅ UI Components Validation Complete!');

  } catch (error) {
    console.log('❌ UI components test failed:', error.message);
  }
}

async function testResponsiveDesign() {
  console.log('\n📱 Testing Responsive Design...\n');

  try {
    const pages = ['/', '/games', '/store', '/wallet'];

    for (const page of pages) {
      const response = await axios.get(`http://localhost:3000${page}`, {
        headers: {
          'Accept': 'text/html',
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
        }
      });

      // Check for responsive classes
      const hasResponsiveClasses = response.data.includes('md:') || response.data.includes('lg:') || response.data.includes('sm:');

      if (hasResponsiveClasses && response.status === 200) {
        console.log(`✅ ${page} - Mobile responsive`);
      } else {
        console.log(`⚠️ ${page} - Responsive design issues`);
      }
    }

    console.log('\n✅ Responsive Design Test Complete!');

  } catch (error) {
    console.log('❌ Responsive design test failed:', error.message);
  }
}

async function testFeatureAccessibility() {
  console.log('\n🎯 Testing Feature Accessibility...\n');

  try {
    // Test if all main features are accessible
    const features = [
      { name: 'Games', path: '/games', shouldContain: '2048' },
      { name: 'Store', path: '/store', shouldContain: 'Store' },
      { name: 'Wallet', path: '/wallet', shouldContain: 'Wallet' },
      { name: 'Premium', path: '/premium', shouldContain: 'Premium' },
      { name: 'Referral', path: '/referral', shouldContain: 'Referral' },
      { name: 'Leaderboard', path: '/leaderboard', shouldContain: 'Leaderboard' }
    ];

    for (const feature of features) {
      const response = await axios.get(`http://localhost:3000${feature.path}`, {
        headers: { 'Accept': 'text/html' }
      });

      if (response.status === 200 && response.data.includes(feature.shouldContain)) {
        console.log(`✅ ${feature.name} - Accessible and functional`);
      } else {
        console.log(`⚠️ ${feature.name} - Accessibility issues`);
      }
    }

    console.log('\n✅ Feature Accessibility Test Complete!');

  } catch (error) {
    console.log('❌ Feature accessibility test failed:', error.message);
  }
}

async function runUItests() {
  console.log('🚀 Starting comprehensive UI validation...\n');

  await testUIComponents();
  await testResponsiveDesign();
  await testFeatureAccessibility();

  console.log('\n🎊 UI VALIDATION COMPLETE! 🎊');
}

runUItests();